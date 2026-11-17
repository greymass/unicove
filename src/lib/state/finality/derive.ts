import { finalizedBy, timeToFinal } from './final';
import { baselineCovered, finalizerRowMarked, producerRowMarked } from './markers';
import { BLOCK_INTERVAL_MS, missedSlots } from './schedule';
import type { FinalityState } from './state';
import type { BaselineFinalizer, BlockMessage, FinalizerPolicy, Qc, Stage } from './v1';

export const HEADLINE_BLOCKS = 20;

export type ChainStage = Exclude<Stage, 'feed'>;
export type StageStatus = 'normal' | 'departure' | 'above_baseline' | 'building' | 'no_data';

export interface Attribution {
	production: number;
	qc: number;
	latency: number;
}

export interface FinalRecord {
	block_num: number;
	by: number;
	ms: number | null;
	split: Attribution | null;
}

export interface QcVotes {
	generation: number;
	votes: number;
	total: number;
	threshold: number;
	over: number;
}

export interface MinutePoint {
	minute: number;
	p90: number | null;
	partial: boolean;
}

export interface ProducerStats {
	producer: string;
	blocks: number;
	missed: number;
	latencyP50: number | null;
	latencyP90: number | null;
	qcBlocks: number;
	votesOverP50: number | null;
	atThreshold: number;
	marked: boolean;
}

export interface FinalizerStats {
	public_key: string;
	description: string;
	pending: boolean;
	qcs: number;
	missing: number;
	weak: number;
	lastVote: number | null;
	behind: number | null;
	marked: boolean;
}

export interface WindowStats {
	blocks: number;
	missedSlots: number;
	forks: number;
	latencyP50: number | null;
	latencyP90: number | null;
	timeToFinalP90: number | null;
	votesOverMin: number | null;
	atThreshold: number;
	qcLag: number;
	weakQcs: number;
	noQc: number;
	producers: ProducerStats[];
	finalizers: FinalizerStats[];
}

export interface StageReading {
	stage: ChainStage;
	figure: number | null;
	forks?: number;
	status: StageStatus;
}

export function quantile(values: readonly number[], q: number): number | null {
	if (!values.length) return null;
	const sorted = [...values].sort((a, b) => a - b);
	return sorted[Math.min(sorted.length - 1, Math.max(0, Math.ceil(q * sorted.length) - 1))];
}

export function median(values: readonly number[]): number | null {
	if (!values.length) return null;
	const sorted = [...values].sort((a, b) => a - b);
	const middle = Math.floor(sorted.length / 2);
	return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
}

export function attribution(block: BlockMessage, by: BlockMessage): Attribution {
	const distance = by.block_num - block.block_num;
	return {
		production: by.timestamp - block.timestamp - distance * BLOCK_INTERVAL_MS,
		qc: (distance - 2) * BLOCK_INTERVAL_MS,
		latency: by.latency
	};
}

export function finality(state: FinalityState): Map<number, FinalRecord> {
	const times = timeToFinal(state.blocks);
	const records = new Map<number, FinalRecord>();
	for (const [num, by] of finalizedBy(state.blocks)) {
		const block = state.blockIndex.get(num);
		if (!block) continue;
		const timed = !block.no_timing && !by.no_timing;
		records.set(num, {
			block_num: num,
			by: by.block_num,
			ms: timed ? (times.get(num) ?? null) : null,
			split: timed ? attribution(block, by) : null
		});
	}
	return records;
}

function timedValues(records: Iterable<FinalRecord>): number[] {
	const values: number[] = [];
	for (const record of records) if (record.ms !== null) values.push(record.ms);
	return values;
}

export function headline(records: ReadonlyMap<number, FinalRecord>): number | null {
	const timed = [...records.values()]
		.filter((record) => record.ms !== null)
		.sort((a, b) => b.block_num - a.block_num)
		.slice(0, HEADLINE_BLOCKS);
	return median(timedValues(timed));
}

export function sparkline(
	state: FinalityState,
	records: ReadonlyMap<number, FinalRecord>
): MinutePoint[] {
	const points: MinutePoint[] = state.minutes.map((row) => ({
		minute: row.minute,
		p90: row.time_to_final_p90,
		partial: false
	}));
	const newest = state.blocks[state.blocks.length - 1];
	if (!newest) return points;
	const minute = Math.floor(newest.timestamp / 60_000) * 60_000;
	const last = points[points.length - 1];
	if (last && last.minute >= minute) return points;
	const current = state.blocks
		.filter((block) => block.timestamp >= minute)
		.map((block) => records.get(block.block_num))
		.filter((record): record is FinalRecord => !!record);
	points.push({ minute, p90: quantile(timedValues(current), 0.9), partial: true });
	return points;
}

function tally(policy: FinalizerPolicy, missing: readonly number[] = []): QcVotes {
	const absent = new Set(missing);
	let votes = 0;
	let total = 0;
	policy.finalizers.forEach((finalizer, index) => {
		total += finalizer.weight;
		if (!absent.has(index)) votes += finalizer.weight;
	});
	return {
		generation: policy.generation,
		votes,
		total,
		threshold: policy.threshold,
		over: votes - policy.threshold
	};
}

export function qcVotes(qc: Qc, policies: ReadonlyMap<number, FinalizerPolicy>): QcVotes | null {
	const policy = policies.get(qc.generation);
	return policy ? tally(policy, qc.missing) : null;
}

export function pendingQcVotes(
	qc: Qc,
	policies: ReadonlyMap<number, FinalizerPolicy>
): QcVotes | null {
	if (qc.pending_generation === undefined) return null;
	const policy = policies.get(qc.pending_generation);
	return policy ? tally(policy, qc.pending_missing) : null;
}

export function isNoQc(block: BlockMessage, previous: BlockMessage | undefined): boolean {
	if (block.qc) return false;
	return !previous || block.qc_claim.block_num <= previous.qc_claim.block_num;
}

export function qcLag(block: BlockMessage): number {
	return block.block_num - block.qc_claim.block_num;
}

function newestPolicyHolding(
	key: string,
	policies: ReadonlyMap<number, FinalizerPolicy>
): FinalizerPolicy | undefined {
	let newest: FinalizerPolicy | undefined;
	for (const policy of policies.values()) {
		if (!policy.finalizers.some((finalizer) => finalizer.public_key === key)) continue;
		if (!newest || policy.generation > newest.generation) newest = policy;
	}
	return newest;
}

function finalizerRows(state: FinalityState): { public_key: string; pending: boolean }[] {
	const active =
		state.policy ??
		[...state.policies.values()].sort((a, b) => b.generation - a.generation)[0] ??
		null;
	if (!active) return [];
	const rows = active.finalizers.map((finalizer) => ({
		public_key: finalizer.public_key,
		pending: false
	}));
	const keys = new Set(rows.map((row) => row.public_key));
	const pending = state.policy?.pending?.finalizers ?? [];
	for (const finalizer of pending) {
		if (keys.has(finalizer.public_key)) continue;
		keys.add(finalizer.public_key);
		rows.push({ public_key: finalizer.public_key, pending: true });
	}
	return rows;
}

interface FinalizerCount {
	qcs: number;
	missing: number;
	weak: number;
	lastVote: number | null;
}

function countFinalizers(state: FinalityState): Map<string, FinalizerCount> {
	const counts = new Map<string, FinalizerCount>();
	const count = (
		policy: FinalizerPolicy | undefined,
		qc: Qc,
		missing: readonly number[] = [],
		weak: readonly number[] = [],
		seen: Set<string>
	) => {
		if (!policy) return;
		const absent = new Set(missing);
		const weakIndex = new Set(weak);
		policy.finalizers.forEach((finalizer, index) => {
			if (seen.has(finalizer.public_key)) return;
			seen.add(finalizer.public_key);
			const entry = counts.get(finalizer.public_key) ?? {
				qcs: 0,
				missing: 0,
				weak: 0,
				lastVote: null
			};
			entry.qcs++;
			if (absent.has(index)) {
				entry.missing++;
			} else if (entry.lastVote === null || qc.block_num > entry.lastVote) {
				entry.lastVote = qc.block_num;
			}
			if (weakIndex.has(index)) entry.weak++;
			counts.set(finalizer.public_key, entry);
		});
	};
	for (const block of state.blocks) {
		const qc = block.qc;
		if (!qc) continue;
		const seen = new Set<string>();
		count(state.policies.get(qc.generation), qc, qc.missing, qc.weak, seen);
		if (qc.pending_generation !== undefined) {
			const pending = state.policies.get(qc.pending_generation);
			count(pending, qc, qc.pending_missing, qc.pending_weak, seen);
		}
	}
	return counts;
}

function producerOrder(state: FinalityState): string[] {
	const newest = state.blocks[state.blocks.length - 1];
	const order = newest ? [...(state.schedules.get(newest.schedule_version)?.producers ?? [])] : [];
	for (const block of state.blocks) {
		if (!order.includes(block.producer)) order.push(block.producer);
	}
	return order;
}

export function windowStats(
	state: FinalityState,
	records: ReadonlyMap<number, FinalRecord> = finality(state)
): WindowStats {
	const blocks = state.blocks;
	const missed = missedSlots(blocks, state.schedules);
	const oldest = blocks[0]?.timestamp ?? Infinity;
	let forks = 0;
	for (const span of state.spans.values()) {
		if (span.reason === 'fork' && (span.open || span.end >= oldest)) forks++;
	}

	const latencies: number[] = [];
	const overs: number[] = [];
	let qcLagCount = 0;
	let weakQcs = 0;
	let noQc = 0;
	const perProducer = new Map<
		string,
		{ blocks: number; latencies: number[]; overs: number[]; qcBlocks: number }
	>();
	blocks.forEach((block, index) => {
		const entry = perProducer.get(block.producer) ?? {
			blocks: 0,
			latencies: [],
			overs: [],
			qcBlocks: 0
		};
		entry.blocks++;
		if (!block.no_timing) {
			latencies.push(block.latency);
			entry.latencies.push(block.latency);
		}
		const previous = blocks[index - 1];
		if (block.qc) {
			entry.qcBlocks++;
			if (!block.qc.is_strong_qc) weakQcs++;
			if (qcLag(block) > 1) qcLagCount++;
			const votes = qcVotes(block.qc, state.policies);
			if (votes) {
				overs.push(votes.over);
				entry.overs.push(votes.over);
			}
		} else if (isNoQc(block, previous?.block_num === block.block_num - 1 ? previous : undefined)) {
			noQc++;
		}
		perProducer.set(block.producer, entry);
	});

	const missedBy = new Map<string, number>();
	for (const slot of missed) {
		if (slot.owner) missedBy.set(slot.owner, (missedBy.get(slot.owner) ?? 0) + 1);
	}

	const producers = producerOrder(state).map((producer): ProducerStats => {
		const entry = perProducer.get(producer);
		const latencyP90 = quantile(entry?.latencies ?? [], 0.9);
		return {
			producer,
			blocks: entry?.blocks ?? 0,
			missed: missedBy.get(producer) ?? 0,
			latencyP50: quantile(entry?.latencies ?? [], 0.5),
			latencyP90,
			qcBlocks: entry?.qcBlocks ?? 0,
			votesOverP50: median(entry?.overs ?? []),
			atThreshold: (entry?.overs ?? []).filter((over) => over <= 0).length,
			marked: producerRowMarked(latencyP90, state.baseline)
		};
	});

	const counts = countFinalizers(state);
	const baselineByKey = new Map<string, BaselineFinalizer>(
		(state.baseline?.finalizers ?? []).map((entry) => [entry.public_key, entry])
	);
	const head = blocks[blocks.length - 1]?.block_num ?? null;
	const finalizers = finalizerRows(state).map((row): FinalizerStats => {
		const count = counts.get(row.public_key) ?? { qcs: 0, missing: 0, weak: 0, lastVote: null };
		const policy = newestPolicyHolding(row.public_key, state.policies);
		return {
			public_key: row.public_key,
			description:
				policy?.finalizers.find((finalizer) => finalizer.public_key === row.public_key)
					?.description ?? row.public_key,
			pending: row.pending,
			qcs: count.qcs,
			missing: count.missing,
			weak: count.weak,
			lastVote: count.lastVote,
			behind: count.lastVote !== null && head !== null ? head - count.lastVote : null,
			marked: finalizerRowMarked(count.missing, count.qcs, baselineByKey.get(row.public_key))
		};
	});

	return {
		blocks: blocks.length,
		missedSlots: missed.length,
		forks,
		latencyP50: quantile(latencies, 0.5),
		latencyP90: quantile(latencies, 0.9),
		timeToFinalP90: quantile(timedValues(records.values()), 0.9),
		votesOverMin: overs.length ? Math.min(...overs) : null,
		atThreshold: overs.filter((over) => over <= 0).length,
		qcLag: qcLagCount,
		weakQcs,
		noQc,
		producers,
		finalizers
	};
}

export function stageReadings(
	state: FinalityState,
	stats: WindowStats,
	options: { reconnecting?: boolean } = {}
): StageReading[] {
	const exceptions = stats.qcLag + stats.weakQcs + stats.noQc;
	const readings: StageReading[] = [
		{
			stage: 'production',
			figure: stats.missedSlots,
			forks: stats.forks,
			status: stats.missedSlots > 0 || stats.forks > 0 ? 'departure' : 'normal'
		},
		{
			stage: 'latency',
			figure: stats.latencyP50,
			status: baselineStatus(state, stats.latencyP90, state.baseline?.latency_p99 ?? null)
		},
		{
			stage: 'votes',
			figure: stats.votesOverMin,
			status:
				stats.atThreshold > 0 || stats.finalizers.some((row) => row.marked) ? 'departure' : 'normal'
		},
		{
			stage: 'qc',
			figure: exceptions,
			status: exceptions > 0 ? 'departure' : 'normal'
		},
		{
			stage: 'final',
			figure: stats.timeToFinalP90,
			status: baselineStatus(state, stats.timeToFinalP90, state.baseline?.time_to_final_p99 ?? null)
		}
	];
	const noData = state.feed?.state === 'paused' || !!options.reconnecting || !state.blocks.length;
	if (!noData) return readings;
	return readings.map((reading) => ({ ...reading, status: 'no_data' }));
}

function baselineStatus(
	state: FinalityState,
	live: number | null,
	p99: number | null
): StageStatus {
	if (!baselineCovered(state.baseline)) return 'building';
	if (live !== null && p99 !== null && live > p99) return 'above_baseline';
	return 'normal';
}
