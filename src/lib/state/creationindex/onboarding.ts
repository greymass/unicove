import {
	requiredPermission,
	type GetPermissions,
	type PermissionDef
} from '$lib/wharf/msig/proposer';
import type { ProgramDay, ProgramEvent } from './client';

export const GIFT_ROW_BYTES = 136;
export const QUOTA_FLOOR = 1972;
export const DEFAULT_QUOTA = 262144;
export const OBSERVED_DAYS = 30;
export const YEAR_DAYS = 366;
export const DAY_MS = 86_400_000;

const PRODUCERS_ACCOUNT = 'eosio.prods';
const MAX_DEPTH = 4;

export const ADMIN_ACTIONS = [
	'addcreator',
	'setquota',
	'suspend',
	'resume',
	'rmcreator',
	'enable',
	'disable'
] as const;

export type AdminAction = (typeof ADMIN_ACTIONS)[number];

const PROGRAM_ACTIONS: AdminAction[] = ['enable', 'disable'];
const SHORT_ACTIONS: AdminAction[] = ['disable', 'suspend', 'resume'];

export function isAdminAction(action: string): action is AdminAction {
	return (ADMIN_ACTIONS as readonly string[]).includes(action);
}

export function expireDays(action: AdminAction): number {
	return SHORT_ACTIONS.includes(action) ? 7 : 90;
}

export interface CreatorRow {
	creator: string;
	daily_quota_bytes: number;
	used_bytes: number;
	window_start: number | null;
	suspended: boolean;
}

export function chainTime(time: string): number {
	return Date.parse(/[zZ]|[+-]\d\d:\d\d$/.test(time) ? time : `${time}Z`);
}

export function isoDay(ms: number): string {
	return new Date(ms).toISOString().slice(0, 10);
}

export function parseCreatorRow(raw: Record<string, unknown>): CreatorRow {
	const start = chainTime(String(raw.window_start ?? ''));
	return {
		creator: String(raw.creator),
		daily_quota_bytes: Number(raw.daily_quota_bytes),
		used_bytes: Number(raw.used_bytes),
		window_start: Number.isFinite(start) && start > 0 ? start : null,
		suspended: raw.suspended === true || Number(raw.suspended) === 1
	};
}

export function windowEnd(row: CreatorRow, now: number): number | null {
	if (row.window_start === null) return null;
	const end = row.window_start + DAY_MS;
	return end > now ? end : null;
}

export function usedNow(row: CreatorRow, now: number): number {
	return windowEnd(row, now) === null ? 0 : row.used_bytes;
}

function since(days: number, now: number): string {
	return isoDay(now - (days - 1) * DAY_MS);
}

export interface Observed {
	gifts: number;
	giftBytes: number;
	returns: number;
	perDay: number;
	runway: number | null;
}

export function observedRunway(
	daily: ProgramDay[],
	returns: ProgramEvent[],
	available: number,
	now: number
): Observed {
	const from = since(OBSERVED_DAYS, now);
	let gifts = 0;
	let giftBytes = 0;
	for (const day of daily) {
		if (day.day < from) continue;
		for (const creator of day.program_creators) {
			gifts += creator.gifts;
			giftBytes += creator.bytes;
		}
	}
	const returned = returns
		.filter((e) => e.type === 'return' && e.block_time.slice(0, 10) >= from)
		.reduce((sum, e) => sum + (e.bytes ?? 0), 0);
	const perDay = (giftBytes + gifts * GIFT_ROW_BYTES - returned) / OBSERVED_DAYS;
	return {
		gifts,
		giftBytes,
		returns: returned,
		perDay,
		runway: perDay > 0 ? available / perDay : null
	};
}

export interface Committed {
	disabled: boolean;
	activeQuota: number;
	suspendedQuota: number;
	activeCreators: number;
	runway: number | null;
}

export function committedRunway(
	creators: CreatorRow[],
	enabled: boolean,
	available: number
): Committed {
	const active = enabled ? creators.filter((c) => !c.suspended) : [];
	const activeQuota = active.reduce((sum, c) => sum + c.daily_quota_bytes, 0);
	const suspendedQuota = creators
		.filter((c) => c.suspended)
		.reduce((sum, c) => sum + c.daily_quota_bytes, 0);
	return {
		disabled: !enabled,
		activeQuota,
		suspendedQuota,
		activeCreators: active.length,
		runway: activeQuota > 0 ? available / activeQuota : null
	};
}

export interface CreatorDay {
	day: string;
	gifts: number;
	bytes: number;
}

export function creatorDays(daily: ProgramDay[], creator: string): CreatorDay[] {
	return daily.flatMap((d) =>
		d.program_creators
			.filter((c) => c.program_creator === creator)
			.map((c) => ({ day: d.day, gifts: c.gifts, bytes: c.bytes }))
	);
}

export function creatorTotals(
	daily: ProgramDay[],
	creator: string,
	days: number,
	now: number
): { gifts: number; bytes: number } {
	const from = since(days, now);
	let gifts = 0;
	let bytes = 0;
	for (const day of creatorDays(daily, creator)) {
		if (day.day < from) continue;
		gifts += day.gifts;
		bytes += day.bytes;
	}
	return { gifts, bytes };
}

export interface CreatorListing {
	name: string;
	row: CreatorRow | null;
	registered: string | null;
}

// Registered creators first, then removed ones, each in registration order.
export function listCreators(
	creators: CreatorRow[],
	adminEvents: ProgramEvent[]
): CreatorListing[] {
	const registered = new Map<string, string>();
	for (const e of adminEvents) {
		if (e.action === 'addcreator' && e.program_creator) {
			registered.set(e.program_creator, e.block_time);
		}
	}
	const names = new Set([...creators.map((c) => c.creator), ...registered.keys()]);
	const rows = new Map(creators.map((c) => [c.creator, c]));
	return [...names]
		.map((name) => ({
			name,
			row: rows.get(name) ?? null,
			registered: registered.get(name) ?? null
		}))
		.toSorted(
			(a, b) =>
				Number(!a.row) - Number(!b.row) ||
				(a.registered ?? '').localeCompare(b.registered ?? '') ||
				a.name.localeCompare(b.name)
		);
}

export type Approver =
	| { kind: 'key'; actor: string }
	| { kind: 'producers'; threshold: number; total: number }
	| { kind: 'accounts'; threshold: number; total: number }
	| { kind: 'permission'; actor: string; permission: string };

// Follows single-account delegation to a key holder or a producer threshold, as the proposer does.
export async function describeApprover(
	actor: string,
	permission: string,
	getPermissions: GetPermissions,
	depth = 0
): Promise<Approver> {
	const def = (await getPermissions(actor))?.find((p) => p.name === permission)?.authority;
	if (!def || depth >= MAX_DEPTH) return { kind: 'permission', actor, permission };
	const keyWeight = def.keys.reduce((sum, k) => sum + k.weight, 0);
	if (keyWeight >= def.threshold) return { kind: 'key', actor };
	const accounts = def.accounts.filter((a) => a.permission.permission !== 'eosio.code');
	if (actor === PRODUCERS_ACCOUNT) {
		return { kind: 'producers', threshold: def.threshold, total: accounts.length };
	}
	if (keyWeight === 0 && accounts.length === 1 && accounts[0].weight >= def.threshold) {
		const next = accounts[0].permission;
		return describeApprover(next.actor, next.permission, getPermissions, depth + 1);
	}
	return { kind: 'accounts', threshold: def.threshold, total: accounts.length };
}

export interface ApprovalGroup {
	permission: string;
	approver: Approver;
	actions: AdminAction[];
}

export async function approvalGroups(
	contract: string,
	permissions: PermissionDef[],
	getPermissions: GetPermissions
): Promise<ApprovalGroup[]> {
	const groups = new Map<string, AdminAction[]>();
	for (const action of ADMIN_ACTIONS) {
		const permission = requiredPermission(permissions, contract, action);
		groups.set(permission, [...(groups.get(permission) ?? []), action]);
	}
	const out = await Promise.all(
		[...groups].map(async ([permission, actions]) => ({
			permission,
			approver: await describeApprover(contract, permission, getPermissions),
			actions
		}))
	);
	return out.toSorted((a, b) => b.actions.length - a.actions.length);
}

export type Blocker =
	| 'bad_name'
	| 'no_account'
	| 'quota_required'
	| 'quota_floor'
	| 'registered'
	| 'unregistered'
	| 'suspended'
	| 'not_suspended'
	| 'same_quota';

export interface FormInput {
	action: AdminAction;
	creator: string;
	quota: number | null;
	row: CreatorRow | null;
	accountExists: boolean | null;
}

// Only what fails on chain at propose time, plus a no-op setquota the contract would accept.
export function blockers(input: FormInput): Blocker[] {
	const { action, creator, quota, row } = input;
	if (PROGRAM_ACTIONS.includes(action)) return [];
	const out: Blocker[] = [];
	if (!/^[a-z1-5.]{1,12}$/.test(creator)) return ['bad_name'];
	if (action === 'addcreator' || action === 'setquota') {
		if (quota === null || !Number.isFinite(quota)) out.push('quota_required');
		else if (quota < QUOTA_FLOOR) out.push('quota_floor');
	}
	if (action === 'addcreator') {
		if (input.accountExists === false) out.push('no_account');
		if (row) out.push('registered');
		return out;
	}
	if (!row) return [...out, 'unregistered'];
	if (action === 'setquota' && quota === row.daily_quota_bytes) out.push('same_quota');
	if (action === 'suspend' && row.suspended) out.push('suspended');
	if (action === 'resume' && !row.suspended) out.push('not_suspended');
	return out;
}

export function wantsLink(input: FormInput): boolean {
	if (input.action === 'addcreator') return true;
	return (
		input.action === 'setquota' &&
		input.row !== null &&
		input.quota !== null &&
		input.quota > input.row.daily_quota_bytes
	);
}

export interface ProposalAction {
	name: string;
	creator: string;
}

export interface OpenProposal {
	proposer: string;
	name: string;
	expiration: string;
	actions: ProposalAction[];
	satisfied: number | null;
	threshold: number | null;
	standby: number;
}

// Program switches conflict with each other; creator actions with any other on the same creator.
export function conflicting(
	action: AdminAction,
	creator: string,
	proposals: OpenProposal[]
): OpenProposal[] {
	const program = PROGRAM_ACTIONS.includes(action);
	return proposals.filter((p) =>
		p.actions.some((a) =>
			program
				? PROGRAM_ACTIONS.includes(a.name as AdminAction)
				: !PROGRAM_ACTIONS.includes(a.name as AdminAction) && a.creator === creator
		)
	);
}
