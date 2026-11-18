import type { StatWindow } from '$lib/state/statindex/utils';
import type {
	ContributionKind,
	Creation,
	CreationDay,
	CreationindexClient,
	DayCreator,
	KindFigures,
	KindsFigures
} from './client';

export type OriginKind = ContributionKind | 'none';

export const CONTRIBUTION_KINDS: ContributionKind[] = [
	'buy',
	'transfer',
	'gift',
	'program_gift',
	'quota_set'
];

export const ORIGIN_KINDS: OriginKind[] = [...CONTRIBUTION_KINDS, 'none'];

export const KIND_COLORS: Record<OriginKind, string> = {
	buy: 'oklch(0.62 0.15 250)',
	transfer: 'oklch(0.68 0.14 160)',
	gift: 'oklch(0.75 0.14 75)',
	program_gift: 'oklch(0.62 0.18 320)',
	quota_set: 'oklch(0.6 0.03 250)',
	none: 'oklch(0.8 0.01 250)'
};

export interface OriginTotals {
	creations: number;
	creations_without_ram: number;
	kinds: KindsFigures;
}

const DAY_MS = 86_400_000;
const MAX_SPAN_DAYS = 366;
const WINDOW_DAYS: Record<Exclude<StatWindow, 'all'>, number> = {
	'30d': 30,
	'90d': 90,
	'365d': 365
};
const MERGED_RANKING_DEPTH = 200;

export const EARLIEST_DAY = '2018-06-09';

function isoDay(time: number): string {
	return new Date(time).toISOString().slice(0, 10);
}

function dayTime(day: string): number {
	return Date.parse(`${day}T00:00:00Z`);
}

export function windowRange(window: StatWindow, now = new Date()): { from: string; to: string } {
	const today = dayTime(now.toISOString().slice(0, 10));
	const to = today - DAY_MS;
	const from = window === 'all' ? dayTime(EARLIEST_DAY) : to - (WINDOW_DAYS[window] - 1) * DAY_MS;
	return { from: isoDay(from), to: isoDay(to) };
}

export function rangeChunks(from: string, to: string): { from: string; to: string }[] {
	const chunks = [];
	const end = dayTime(to);
	for (let start = dayTime(from); start <= end; ) {
		const stop = Math.min(start + (MAX_SPAN_DAYS - 1) * DAY_MS, end);
		chunks.push({ from: isoDay(start), to: isoDay(stop) });
		start = stop + DAY_MS;
	}
	return chunks;
}

function emptyFigures(): KindFigures {
	return { contributions: 0, bytes: null, without_bytes: 0, requested_bytes: null, quantity: null };
}

export function emptyKinds(): KindsFigures {
	return Object.fromEntries(
		CONTRIBUTION_KINDS.map((kind) => [kind, emptyFigures()])
	) as KindsFigures;
}

function addNullable(a: number | null, b: number | null): number | null {
	if (a === null) return b;
	if (b === null) return a;
	return a + b;
}

function quantityUnits(quantity: string): { units: bigint; decimals: number; symbol: string } {
	const [amount, symbol] = quantity.split(' ');
	const [whole, fraction = ''] = amount.split('.');
	return { units: BigInt(whole + fraction), decimals: fraction.length, symbol };
}

export function addQuantities(a: string | null, b: string | null): string | null {
	if (!a) return b;
	if (!b) return a;
	const x = quantityUnits(a);
	const y = quantityUnits(b);
	const sum = (x.units + y.units).toString().padStart(x.decimals + 1, '0');
	const whole = sum.slice(0, sum.length - x.decimals);
	const fraction = x.decimals ? `.${sum.slice(-x.decimals)}` : '';
	return `${whole}${fraction} ${x.symbol}`;
}

export function mergeKinds(a: KindsFigures, b: KindsFigures): KindsFigures {
	const merged = {} as KindsFigures;
	for (const kind of CONTRIBUTION_KINDS) {
		const x = a[kind] ?? emptyFigures();
		const y = b[kind] ?? emptyFigures();
		merged[kind] = {
			contributions: x.contributions + y.contributions,
			bytes: addNullable(x.bytes, y.bytes),
			without_bytes: x.without_bytes + y.without_bytes,
			requested_bytes: addNullable(x.requested_bytes, y.requested_bytes),
			quantity: addQuantities(x.quantity, y.quantity)
		};
	}
	return merged;
}

export function sumTotals(rows: OriginTotals[]): OriginTotals {
	return rows.reduce<OriginTotals>(
		(sum, row) => ({
			creations: sum.creations + row.creations,
			creations_without_ram: sum.creations_without_ram + row.creations_without_ram,
			kinds: mergeKinds(sum.kinds, row.kinds)
		}),
		{ creations: 0, creations_without_ram: 0, kinds: emptyKinds() }
	);
}

export function kindCount(totals: OriginTotals, kind: OriginKind): number {
	return kind === 'none' ? totals.creations_without_ram : totals.kinds[kind].contributions;
}

export function fillDays(days: CreationDay[], from: string, to: string): CreationDay[] {
	const byDay = new Map(days.map((day) => [day.day, day]));
	const filled: CreationDay[] = [];
	for (let time = dayTime(from); time <= dayTime(to); time += DAY_MS) {
		const day = isoDay(time);
		filled.push(byDay.get(day) ?? { day, ...sumTotals([]) });
	}
	return filled;
}

export function monthlyDays(days: CreationDay[]): CreationDay[] {
	const months = new Map<string, CreationDay[]>();
	for (const day of days) {
		const month = `${day.day.slice(0, 7)}-01`;
		months.set(month, [...(months.get(month) ?? []), day]);
	}
	const monthly = [...months].map(([day, rows]) => ({ day, ...sumTotals(rows) }));
	const first = monthly.findIndex((month) => month.creations > 0);
	return first === -1 ? [] : monthly.slice(first);
}

export async function loadDays(
	client: CreationindexClient,
	window: StatWindow,
	creator?: string,
	now = new Date()
): Promise<CreationDay[]> {
	const { from, to } = windowRange(window, now);
	const parts = await Promise.all(
		rangeChunks(from, to).map((chunk) => client.getDaily(chunk.from, chunk.to, creator))
	);
	const days = fillDays(
		parts.flatMap((part) => part.days),
		from,
		to
	);
	return window === 'all' ? monthlyDays(days) : days;
}

export function mergeRankings(pages: DayCreator[][], limit: number): DayCreator[] {
	const merged = new Map<string, DayCreator>();
	for (const row of pages.flat()) {
		const previous = merged.get(row.creator);
		merged.set(
			row.creator,
			previous ? { creator: row.creator, ...sumTotals([previous, row]) } : row
		);
	}
	return [...merged.values()]
		.sort((a, b) => b.creations - a.creations || a.creator.localeCompare(b.creator))
		.slice(0, limit);
}

export async function loadRanking(
	client: CreationindexClient,
	window: StatWindow,
	limit: number,
	now = new Date()
): Promise<DayCreator[]> {
	const { from, to } = windowRange(window, now);
	const chunks = rangeChunks(from, to);
	if (chunks.length === 1) {
		return (await client.getCreators(from, to, { limit })).creators;
	}
	const pages = await Promise.all(
		chunks.map((chunk) => client.getCreators(chunk.from, chunk.to, { limit: MERGED_RANKING_DEPTH }))
	);
	return mergeRankings(
		pages.map((page) => page.creators),
		limit
	);
}

export function creationKind(creation: Creation): OriginKind {
	return creation.contributions[0]?.kind ?? 'none';
}
