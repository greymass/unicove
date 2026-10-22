import { describe, expect, test } from 'bun:test';
import { Action, Name, Serializer, TimePointSec } from '@wharfkit/antelope';

import {
	authorizeActions,
	buildProposal,
	ProposeData,
	requiredPermission,
	resolveApprovers,
	suggestProposalName,
	type GetPermissions,
	type PermissionDef
} from './proposer';

const PRODUCERS = Array.from({ length: 21 }, (_, i) => `producer${'abcdefghijklmnopqrstu'[i]}`);

function keys(threshold: number, links: PermissionDef['links'] = []): Omit<PermissionDef, 'name'> {
	return { authority: { threshold, keys: [{ weight: 1 }], accounts: [], waits: [] }, links };
}

function accounts(
	threshold: number,
	levels: [string, string][],
	links: PermissionDef['links'] = []
): Omit<PermissionDef, 'name'> {
	return {
		authority: {
			threshold,
			keys: [],
			waits: [],
			accounts: levels.map(([actor, permission]) => ({
				permission: { actor, permission },
				weight: 1
			}))
		},
		links
	};
}

function chain(defs: Record<string, Record<string, Omit<PermissionDef, 'name'>>>): {
	get: GetPermissions;
	calls: string[];
} {
	const calls: string[] = [];
	return {
		calls,
		get: async (actor) => {
			calls.push(actor);
			const perms = defs[actor];
			return perms ? Object.entries(perms).map(([name, def]) => ({ name, ...def })) : null;
		}
	};
}

const prods = {
	owner: keys(1),
	active: accounts(
		15,
		PRODUCERS.map((p) => [p, 'active'])
	),
	'prod.major': accounts(
		11,
		PRODUCERS.map((p) => [p, 'active'])
	),
	'prod.minor': accounts(
		8,
		PRODUCERS.map((p) => [p, 'active'])
	)
};

const jungle4 = chain({
	'gift.gm': {
		owner: keys(1),
		active: {
			authority: {
				threshold: 1,
				keys: [{ weight: 1 }],
				waits: [],
				accounts: [{ permission: { actor: 'gift.gm', permission: 'eosio.code' }, weight: 1 }]
			},
			links: []
		}
	},
	'eosio.prods': prods
});

const mainnet = chain({
	'gift.vaulta': {
		owner: accounts(1, [['eosio.prods', 'active']]),
		active: accounts(1, [['eosio.prods', 'active']]),
		halt: accounts(
			1,
			[['eosio.prods', 'prod.major']],
			[
				{ account: 'gift.vaulta', action: 'disable' },
				{ account: 'gift.vaulta', action: 'resume' }
			]
		),
		suspend: accounts(
			1,
			[['eosio.prods', 'prod.minor']],
			[{ account: 'gift.vaulta', action: 'suspend' }]
		)
	},
	'eosio.prods': prods
});

const level = (actor: string, permission = 'active') => ({ actor, permission });
const producerLevels = PRODUCERS.map((p) => level(p));

describe('requiredPermission', () => {
	test('follows VP-0001 links on gift.vaulta', async () => {
		const perms = (await mainnet.get('gift.vaulta'))!;
		expect(requiredPermission(perms, 'gift.vaulta', 'disable')).toBe('halt');
		expect(requiredPermission(perms, 'gift.vaulta', 'resume')).toBe('halt');
		expect(requiredPermission(perms, 'gift.vaulta', 'suspend')).toBe('suspend');
		for (const action of ['enable', 'addcreator', 'rmcreator', 'setquota']) {
			expect(requiredPermission(perms, 'gift.vaulta', action)).toBe('active');
		}
	});

	test('falls back to active on gift.gm, which has no links', async () => {
		const perms = (await jungle4.get('gift.gm'))!;
		expect(requiredPermission(perms, 'gift.gm', 'disable')).toBe('active');
		expect(requiredPermission(perms, 'gift.gm', 'suspend')).toBe('active');
	});

	test('prefers an action link over a contract-wide link', () => {
		const perms: PermissionDef[] = [
			{ name: 'wide', ...keys(1, [{ account: 'token', action: null }]) },
			{ name: 'exact', ...keys(1, [{ account: 'token', action: 'transfer' }]) }
		];
		expect(requiredPermission(perms, 'token', 'transfer')).toBe('exact');
		expect(requiredPermission(perms, 'token', 'issue')).toBe('wide');
		expect(requiredPermission(perms, 'other', 'transfer')).toBe('active');
	});
});

describe('resolveApprovers', () => {
	test('requests key-satisfied gift.gm@active as itself, skipping eosio.code', async () => {
		const approvers = await resolveApprovers({
			authorizations: [level('gift.gm')],
			getPermissions: jungle4.get
		});
		expect(approvers).toEqual([level('gift.gm')]);
	});

	test('expands gift.vaulta@active through eosio.prods@active to the schedule', async () => {
		const approvers = await resolveApprovers({
			authorizations: [level('gift.vaulta')],
			getPermissions: mainnet.get
		});
		expect(approvers).toEqual(producerLevels);
	});

	test('expands halt and suspend through prod.major and prod.minor', async () => {
		for (const permission of ['halt', 'suspend']) {
			const approvers = await resolveApprovers({
				authorizations: [level('gift.vaulta', permission)],
				getPermissions: mainnet.get
			});
			expect(approvers).toEqual(producerLevels);
		}
	});

	test('adds producer candidates to an eosio.prods expansion without duplicates', async () => {
		const candidates = [...PRODUCERS.slice(0, 20), 'standbyone', 'standbytwo'];
		const approvers = await resolveApprovers({
			authorizations: [level('gift.vaulta', 'halt')],
			getPermissions: mainnet.get,
			producerCandidates: candidates
		});
		expect(approvers).toEqual([...producerLevels, level('standbyone'), level('standbytwo')]);
	});

	test('leaves producer candidates out of other expansions', async () => {
		const { get } = chain({
			shared: {
				active: accounts(2, [
					['alice', 'active'],
					['bob', 'active']
				])
			}
		});
		const approvers = await resolveApprovers({
			authorizations: [level('shared')],
			getPermissions: get,
			producerCandidates: ['standbyone']
		});
		expect(approvers).toEqual([level('alice'), level('bob')]);
	});

	test('merges approvers across authorizations', async () => {
		const approvers = await resolveApprovers({
			authorizations: [level('gift.vaulta', 'halt'), level('gift.vaulta', 'suspend')],
			getPermissions: mainnet.get
		});
		expect(approvers).toEqual(producerLevels);
	});

	test('requests an unknown permission or account as itself', async () => {
		const approvers = await resolveApprovers({
			authorizations: [level('gift.vaulta', 'missing'), level('nobody')],
			getPermissions: mainnet.get
		});
		expect(approvers).toEqual([level('gift.vaulta', 'missing'), level('nobody')]);
	});

	test('requests a permission needing keys and accounts together as itself', async () => {
		const { get } = chain({
			mixed: {
				active: {
					authority: {
						threshold: 2,
						keys: [{ weight: 1 }],
						waits: [],
						accounts: [{ permission: level('alice'), weight: 1 }]
					},
					links: []
				}
			}
		});
		expect(
			await resolveApprovers({ authorizations: [level('mixed')], getPermissions: get })
		).toEqual([level('mixed')]);
	});

	test('stops on a delegation cycle', async () => {
		const { get } = chain({
			a: { active: accounts(1, [['b', 'active']]) },
			b: { active: accounts(1, [['a', 'active']]) }
		});
		expect(await resolveApprovers({ authorizations: [level('a')], getPermissions: get })).toEqual([
			level('a')
		]);
	});
});

describe('authorizeActions', () => {
	const action = (name: string) =>
		Action.from({ account: 'gift.vaulta', name, authorization: [], data: '' });

	test('authorizes each gift.vaulta action with its linked permission', async () => {
		const actions = await authorizeActions(
			'gift.vaulta',
			[action('disable'), action('suspend'), action('setquota')],
			mainnet.get
		);
		expect(actions.map((a) => String(a.authorization[0]))).toEqual([
			'gift.vaulta@halt',
			'gift.vaulta@suspend',
			'gift.vaulta@active'
		]);
	});
});

describe('suggestProposalName', () => {
	test('prefixes the action and fills a valid 12-character name', () => {
		for (const action of ['disable', 'addcreator', 'a.b']) {
			const name = suggestProposalName(action);
			expect(name).toHaveLength(12);
			expect(name).toMatch(/^[a-z1-5]{12}$/);
			expect(name.startsWith(action.replace('.', '').slice(0, 7))).toBe(true);
			expect(String(Name.from(name))).toBe(name);
		}
	});
});

describe('buildProposal', () => {
	test('wraps the actions in an eosio.msig propose from the proposer', async () => {
		const [disable] = await authorizeActions(
			'gift.vaulta',
			[Action.from({ account: 'gift.vaulta', name: 'disable', authorization: [], data: '' })],
			mainnet.get
		);
		const requested = await resolveApprovers({
			authorizations: disable.authorization.map((a) => ({
				actor: String(a.actor),
				permission: String(a.permission)
			})),
			getPermissions: mainnet.get
		});
		const propose = buildProposal({
			proposer: level('teamgreymass'),
			proposalName: 'giftdisable1',
			requested,
			actions: [disable],
			header: {
				expiration: TimePointSec.from('2026-11-20T00:00:00'),
				ref_block_num: 1,
				ref_block_prefix: 2
			} as never
		});
		expect(String(propose.account)).toBe('eosio.msig');
		expect(String(propose.name)).toBe('propose');
		expect(String(propose.authorization[0])).toBe('teamgreymass@active');
		const data = Serializer.decode({ data: propose.data, type: ProposeData });
		expect(String(data.proposal_name)).toBe('giftdisable1');
		expect(data.requested.map(String)).toEqual(producerLevels.map((l) => `${l.actor}@active`));
		expect(String(data.trx.expiration)).toBe('2026-11-20T00:00:00');
		expect(String(data.trx.actions[0].authorization[0])).toBe('gift.vaulta@halt');
	});
});
