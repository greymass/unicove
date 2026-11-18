import {
	Action,
	type API,
	type APIClient,
	Name,
	PermissionLevel,
	Struct,
	Transaction,
	type TransactionHeader
} from '@wharfkit/antelope';

import { generateRandomName } from '$lib/utils/random';
import type { AuthorityDef } from './authority';

export interface Level {
	actor: string;
	permission: string;
}

export interface PermissionDef {
	name: string;
	authority: AuthorityDef;
	links: { account: string; action: string | null }[];
}

export type GetPermissions = (actor: string) => Promise<PermissionDef[] | null>;

export interface ResolveApproversInput {
	authorizations: Level[];
	getPermissions: GetPermissions;
	producerCandidates?: string[];
	maxDepth?: number;
}

export interface BuildProposalInput {
	proposer: Level;
	proposalName: string;
	requested: Level[];
	actions: Action[];
	header: TransactionHeader;
}

const DEFAULT_MAX_DEPTH = 4;
const PRODUCERS_ACCOUNT = 'eosio.prods';

export const DEFAULT_PROPOSAL_EXPIRE_SECONDS = 60 * 60 * 24 * 30;

// Declared without decorators so it loads under bun test, unlike the generated msig contract.
export class ProposeData extends Struct {
	static abiName = 'propose';
	static abiFields = [
		{ name: 'proposer', type: Name },
		{ name: 'proposal_name', type: Name },
		{ name: 'requested', type: PermissionLevel, array: true },
		{ name: 'trx', type: Transaction }
	];
	declare proposer: Name;
	declare proposal_name: Name;
	declare requested: PermissionLevel[];
	declare trx: Transaction;
}

function levelKey(level: Level): string {
	return `${level.actor}@${level.permission}`;
}

function toPermissionDef(permission: API.v1.AccountPermission): PermissionDef {
	const auth = permission.required_auth;
	return {
		name: String(permission.perm_name),
		authority: {
			threshold: Number(auth.threshold),
			keys: auth.keys.map((k) => ({ weight: Number(k.weight) })),
			waits: auth.waits.map((w) => ({ wait_sec: Number(w.wait_sec), weight: Number(w.weight) })),
			accounts: auth.accounts.map((a) => ({
				permission: {
					actor: String(a.permission.actor),
					permission: String(a.permission.permission)
				},
				weight: Number(a.weight)
			}))
		},
		links: (permission.linked_actions ?? []).map((link) => ({
			account: String(link.account),
			action: link.action && String(link.action) ? String(link.action) : null
		}))
	};
}

export function chainPermissions(client: APIClient): GetPermissions {
	const accounts = new Map<string, Promise<PermissionDef[] | null>>();
	return (actor) => {
		let pending = accounts.get(actor);
		if (!pending) {
			pending = client.v1.chain
				.get_account(actor)
				.then((account) => account.permissions.map(toPermissionDef))
				.catch(() => null);
			accounts.set(actor, pending);
		}
		return pending;
	};
}

// Mirrors the chain's lookup: an action link, then a contract-wide link, then active.
export function requiredPermission(
	permissions: PermissionDef[],
	contract: string,
	action: string
): string {
	const exact = permissions.find((p) =>
		p.links.some((l) => l.account === contract && l.action === action)
	);
	if (exact) return exact.name;
	const wide = permissions.find((p) =>
		p.links.some((l) => l.account === contract && l.action === null)
	);
	return wide ? wide.name : 'active';
}

export async function authorizeActions(
	actor: string,
	actions: Action[],
	getPermissions: GetPermissions
): Promise<Action[]> {
	const permissions = (await getPermissions(actor)) ?? [];
	return actions.map((action) =>
		Action.from({
			...action,
			authorization: [
				PermissionLevel.from({
					actor,
					permission: requiredPermission(permissions, String(action.account), String(action.name))
				})
			]
		})
	);
}

async function resolveLevel(
	level: Level,
	depth: number,
	seen: Set<string>,
	ctx: { getPermissions: GetPermissions; producerCandidates: string[]; maxDepth: number }
): Promise<Level[]> {
	const key = levelKey(level);
	if (depth >= ctx.maxDepth || seen.has(key)) return [level];
	seen.add(key);

	const permissions = await ctx.getPermissions(level.actor);
	const def = permissions?.find((p) => p.name === level.permission)?.authority;
	if (!def) return [level];

	const keyWeight = def.keys.reduce((sum, k) => sum + k.weight, 0);
	if (keyWeight >= def.threshold) return [level];

	const accounts = def.accounts.filter((a) => a.permission.permission !== 'eosio.code');
	if (accounts.length === 0 || keyWeight > 0) return [level];

	if (accounts.length === 1 && accounts[0].weight >= def.threshold) {
		return resolveLevel(accounts[0].permission, depth + 1, seen, ctx);
	}

	const levels = accounts.map((a) => a.permission);
	if (level.actor === PRODUCERS_ACCOUNT) {
		levels.push(...ctx.producerCandidates.map((actor) => ({ actor, permission: 'active' })));
	}
	return levels;
}

export async function resolveApprovers(input: ResolveApproversInput): Promise<Level[]> {
	const ctx = {
		getPermissions: input.getPermissions,
		producerCandidates: input.producerCandidates ?? [],
		maxDepth: input.maxDepth ?? DEFAULT_MAX_DEPTH
	};
	const approvers = new Map<string, Level>();
	for (const auth of input.authorizations) {
		for (const level of await resolveLevel(auth, 0, new Set(), ctx)) {
			approvers.set(levelKey(level), level);
		}
	}
	return [...approvers.values()];
}

export function suggestProposalName(action: string): string {
	const prefix = action.replace(/[^a-z1-5]/g, '').slice(0, 7);
	return prefix + generateRandomName(12 - prefix.length);
}

export function buildProposal(input: BuildProposalInput): Action {
	const trx = Transaction.from({
		...input.header,
		actions: input.actions,
		context_free_actions: [],
		transaction_extensions: []
	});
	return Action.from({
		account: 'eosio.msig',
		name: 'propose',
		authorization: [PermissionLevel.from(input.proposer)],
		data: ProposeData.from({
			proposer: input.proposer.actor,
			proposal_name: input.proposalName,
			requested: input.requested,
			trx
		})
	});
}
