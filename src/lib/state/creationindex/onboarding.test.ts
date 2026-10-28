import { describe, expect, test } from 'bun:test';
import type { PermissionDef } from '$lib/wharf/msig/proposer';
import type { ProgramDay, ProgramEvent } from './client';
import {
	approvalGroups,
	blockers,
	committedRunway,
	conflicting,
	creatorTotals,
	describeApprover,
	expireDays,
	listCreators,
	observedRunway,
	parseCreatorRow,
	usedNow,
	wantsLink,
	type CreatorRow,
	type FormInput,
	type OpenProposal
} from './onboarding';

const NOW = Date.parse('2026-10-22T12:00:00Z');

function row(overrides: Partial<CreatorRow> = {}): CreatorRow {
	return {
		creator: 'gm',
		daily_quota_bytes: 262144,
		used_bytes: 4000,
		window_start: Date.parse('2026-10-22T06:00:00Z'),
		suspended: false,
		...overrides
	};
}

function event(overrides: Partial<ProgramEvent>): ProgramEvent {
	return {
		type: 'admin',
		action: 'addcreator',
		global_seq: 1,
		block_num: 1,
		block_time: '2026-10-01T00:00:00.000',
		trx_id: '',
		program_creator: 'gm',
		from: '',
		to: '',
		payer: '',
		bytes: null,
		absolute_quota: false,
		daily_quota_bytes: null,
		quantity: null,
		fee: null,
		memo: '',
		in_creation: false,
		...overrides
	};
}

function day(date: string, creators: [string, number, number][]): ProgramDay {
	return {
		day: date,
		program_creators: creators.map(([program_creator, gifts, bytes]) => ({
			program_creator,
			gifts,
			accounts: gifts,
			bytes,
			bytes_per_account: {}
		}))
	};
}

function permission(
	name: string,
	threshold: number,
	keys: number[],
	accounts: [string, string, number][],
	links: { account: string; action: string | null }[] = []
): PermissionDef {
	return {
		name,
		authority: {
			threshold,
			keys: keys.map((weight) => ({ weight })),
			waits: [],
			accounts: accounts.map(([actor, perm, weight]) => ({
				permission: { actor, permission: perm },
				weight
			}))
		},
		links
	};
}

const producers = Array.from({ length: 21 }, (_, i): [string, string, number] => [
	`prod${String.fromCharCode(97 + i)}`,
	'active',
	1
]);

const tree: Record<string, PermissionDef[]> = {
	'gift.gm': [
		permission('owner', 1, [1], []),
		permission('active', 1, [1], [['gift.gm', 'eosio.code', 1]])
	],
	'gift.vaulta': [
		permission('owner', 1, [], [['eosio.prods', 'active', 1]]),
		permission('active', 1, [], [['eosio.prods', 'active', 1]]),
		permission(
			'halt',
			1,
			[],
			[['eosio.prods', 'prod.major', 1]],
			[
				{ account: 'gift.vaulta', action: 'disable' },
				{ account: 'gift.vaulta', action: 'resume' }
			]
		),
		permission(
			'suspend',
			1,
			[],
			[['eosio.prods', 'prod.minor', 1]],
			[{ account: 'gift.vaulta', action: 'suspend' }]
		)
	],
	'eosio.prods': [
		permission('active', 15, [], producers),
		permission('prod.major', 11, [], producers),
		permission('prod.minor', 8, [], producers)
	]
};
const getPermissions = async (actor: string) => tree[actor] ?? null;

describe('creator rows', () => {
	test('parses a table row', () => {
		expect(
			parseCreatorRow({
				creator: 'gm',
				daily_quota_bytes: '262144',
				used_bytes: 3104,
				window_start: '2026-10-22T06:00:00',
				suspended: 0
			})
		).toEqual(row({ used_bytes: 3104 }));
		expect(
			parseCreatorRow({ creator: 'gm', window_start: '1970-01-01T00:00:00' }).window_start
		).toBe(null);
	});

	test('counts usage only inside an open window', () => {
		expect(usedNow(row(), NOW)).toBe(4000);
		expect(usedNow(row({ window_start: NOW - 86_400_001 }), NOW)).toBe(0);
		expect(usedNow(row({ window_start: null }), NOW)).toBe(0);
	});
});

describe('runways', () => {
	test('observed runway nets gifts, rows and returns over 30 days', () => {
		const daily = [
			day('2026-09-22', [['gm', 100, 1_000_000]]),
			day('2026-09-23', [['gm', 2, 6000]]),
			day('2026-10-22', [
				['gm', 1, 3000],
				['', 1, 1000]
			])
		];
		const returns = [
			event({
				type: 'return',
				action: 'ungiftram',
				bytes: 1000,
				block_time: '2026-10-01T00:00:00'
			}),
			event({ type: 'return', action: 'ungiftram', bytes: 9999, block_time: '2026-09-01T00:00:00' })
		];
		const o = observedRunway(daily, returns, 300_000, NOW);
		expect(o.gifts).toBe(4);
		expect(o.giftBytes).toBe(10000);
		expect(o.returns).toBe(1000);
		expect(o.perDay).toBeCloseTo((10000 + 4 * 136 - 1000) / 30);
		expect(o.runway).toBeCloseTo(300_000 / o.perDay);
	});

	test('observed runway has no figure without net outflow', () => {
		expect(observedRunway([], [], 1000, NOW).runway).toBe(null);
	});

	test('committed runway counts only creators who can gift now', () => {
		const creators = [
			row(),
			row({ creator: 'other', daily_quota_bytes: 100_000 }),
			row({ creator: 'held', daily_quota_bytes: 50_000, suspended: true })
		];
		const c = committedRunway(creators, true, 724_288);
		expect(c).toEqual({
			disabled: false,
			activeQuota: 362_144,
			suspendedQuota: 50_000,
			activeCreators: 2,
			runway: 2
		});
		const off = committedRunway(creators, false, 724_288);
		expect(off.disabled).toBe(true);
		expect(off.runway).toBe(null);
		expect(off.suspendedQuota).toBe(50_000);
	});

	test('creator totals honour the window', () => {
		const daily = [day('2026-01-01', [['gm', 5, 5000]]), day('2026-10-20', [['gm', 2, 2000]])];
		expect(creatorTotals(daily, 'gm', 30, NOW)).toEqual({ gifts: 2, bytes: 2000 });
		expect(creatorTotals(daily, 'gm', 366, NOW)).toEqual({ gifts: 7, bytes: 7000 });
	});
});

describe('listCreators', () => {
	test('lists registered creators before removed ones with their latest admission', () => {
		const events = [
			event({ program_creator: 'old', block_time: '2026-08-01T00:00:00' }),
			event({ program_creator: 'gm', block_time: '2026-09-01T00:00:00' }),
			event({ action: 'rmcreator', program_creator: 'gm', block_time: '2026-09-02T00:00:00' }),
			event({ program_creator: 'gm', block_time: '2026-09-03T00:00:00' }),
			event({ action: 'rmcreator', program_creator: 'old', block_time: '2026-09-04T00:00:00' })
		];
		const list = listCreators([row()], events);
		expect(list.map((c) => [c.name, c.registered, !!c.row])).toEqual([
			['gm', '2026-09-03T00:00:00', true],
			['old', '2026-08-01T00:00:00', false]
		]);
	});
});

describe('approvers', () => {
	test('names a key holder', async () => {
		expect(await describeApprover('gift.gm', 'active', getPermissions)).toEqual({
			kind: 'key',
			actor: 'gift.gm'
		});
	});

	test('follows delegation to a producer threshold', async () => {
		expect(await describeApprover('gift.vaulta', 'suspend', getPermissions)).toEqual({
			kind: 'producers',
			threshold: 8,
			total: 21
		});
	});

	test('groups admin actions by the permission each needs', async () => {
		const groups = await approvalGroups('gift.vaulta', tree['gift.vaulta'], getPermissions);
		expect(groups.map((g) => [g.permission, g.actions, g.approver])).toEqual([
			[
				'active',
				['addcreator', 'setquota', 'rmcreator', 'enable'],
				{ kind: 'producers', threshold: 15, total: 21 }
			],
			['halt', ['resume', 'disable'], { kind: 'producers', threshold: 11, total: 21 }],
			['suspend', ['suspend'], { kind: 'producers', threshold: 8, total: 21 }]
		]);
		const jungle = await approvalGroups('gift.gm', tree['gift.gm'], getPermissions);
		expect(jungle).toHaveLength(1);
		expect(jungle[0].approver).toEqual({ kind: 'key', actor: 'gift.gm' });
	});
});

describe('form rules', () => {
	const input = (overrides: Partial<FormInput>): FormInput => ({
		action: 'setquota',
		creator: 'gm',
		quota: 300_000,
		row: row(),
		accountExists: true,
		...overrides
	});

	test('expirations are short for stops', () => {
		expect(expireDays('disable')).toBe(7);
		expect(expireDays('suspend')).toBe(7);
		expect(expireDays('resume')).toBe(7);
		expect(expireDays('enable')).toBe(90);
		expect(expireDays('addcreator')).toBe(90);
	});

	test('blocks what fails at propose time', () => {
		expect(blockers(input({}))).toEqual([]);
		expect(blockers(input({ quota: 1971 }))).toEqual(['quota_floor']);
		expect(blockers(input({ quota: 262144 }))).toEqual(['same_quota']);
		expect(blockers(input({ quota: null }))).toEqual(['quota_required']);
		expect(blockers(input({ row: null }))).toEqual(['unregistered']);
		expect(blockers(input({ creator: 'Bad Name' }))).toEqual(['bad_name']);
		expect(blockers(input({ action: 'addcreator', row: null, accountExists: false }))).toEqual([
			'no_account'
		]);
		expect(blockers(input({ action: 'addcreator' }))).toEqual(['registered']);
		expect(blockers(input({ action: 'suspend', row: row({ suspended: true }) }))).toEqual([
			'suspended'
		]);
		expect(blockers(input({ action: 'resume' }))).toEqual(['not_suspended']);
		expect(blockers(input({ action: 'disable', creator: '' }))).toEqual([]);
	});

	test('asks for a link on admissions and quota increases', () => {
		expect(wantsLink(input({ action: 'addcreator', row: null }))).toBe(true);
		expect(wantsLink(input({}))).toBe(true);
		expect(wantsLink(input({ quota: 100_000 }))).toBe(false);
		expect(wantsLink(input({ action: 'suspend' }))).toBe(false);
	});

	test('finds conflicting open proposals', () => {
		const proposal = (name: string, actions: [string, string][]): OpenProposal => ({
			proposer: 'aaron',
			name,
			expiration: '2026-11-01T00:00:00',
			actions: actions.map(([n, creator]) => ({ name: n, creator })),
			satisfied: 0,
			threshold: 1,
			standby: 0
		});
		const open = [
			proposal('stop', [['disable', '']]),
			proposal('hold', [['suspend', 'gm']]),
			proposal('other', [['setquota', 'other']])
		];
		expect(conflicting('enable', '', open).map((p) => p.name)).toEqual(['stop']);
		expect(conflicting('resume', 'gm', open).map((p) => p.name)).toEqual(['hold']);
		expect(conflicting('addcreator', 'new', open)).toEqual([]);
	});
});
