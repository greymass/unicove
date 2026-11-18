import { describe, expect, test } from 'bun:test';
import {
	attribution,
	finality,
	headline,
	pendingQcVotes,
	qcVotes,
	stageReadings,
	windowStats
} from './derive';
import { FINALIZER_COVERAGE_QCS } from './markers';
import { emptyState, reduce, type FinalityState } from './state';
import { T0, block, chain, policy, schedule, span } from './testdata';
import type { BaselineMessage, BlockMessage, Message } from './v1';

function apply(messages: Message[], state: FinalityState = emptyState()): FinalityState {
	return messages.reduce(reduce, state);
}

function baseline(overrides: Partial<BaselineMessage> = {}): BaselineMessage {
	return {
		type: 'baseline',
		from: 0,
		to: 0,
		minutes: 1440,
		time_to_final_p50: 1100,
		time_to_final_p99: 1200,
		latency_p99: 150,
		votes_over_threshold_p1: 0,
		finalizers: [],
		producers: [],
		grid: [],
		...overrides
	};
}

function healthy(extra: Message[] = []): FinalityState {
	return apply([
		policy(),
		schedule(['alpha']),
		baseline(),
		...chain(1000, 1040),
		...extra,
		{ type: 'snapshot_end' }
	]);
}

describe('time to final and attribution', () => {
	test('the split sums to time to final minus 1,000 ms on every timed block', () => {
		const blocks: BlockMessage[] = [];
		let timestamp = T0;
		for (let num = 1000; num < 1060; num++) {
			timestamp += num % 7 === 0 ? 1500 : 500;
			blocks.push(
				block(num, {
					timestamp,
					latency: (num * 37) % 300,
					final: num % 5 === 0 ? undefined : [num - (num % 3 === 0 ? 3 : 2), num - 2]
				})
			);
		}
		const state = apply(blocks);
		const records = finality(state);
		let checked = 0;
		for (const record of records.values()) {
			if (record.ms === null || !record.split) continue;
			const { production, qc, latency } = record.split;
			expect(production + qc + latency).toBe(record.ms - 1000);
			checked++;
		}
		expect(checked).toBeGreaterThan(30);
	});

	test('production carries the missed slots and qc the extra distance', () => {
		const b = block(100, { timestamp: T0 });
		const m = block(103, { timestamp: T0 + 2000, latency: 120 });
		expect(attribution(b, m)).toEqual({ production: 500, qc: 500, latency: 120 });
	});

	test('a block counts only when it and its finalizer have timing', () => {
		const state = apply([
			block(1000, { no_timing: true }),
			block(1001),
			block(1002, { final: [1000, 1000] }),
			block(1003, { final: [1001, 1001], no_timing: true }),
			block(1004, { final: [1002, 1002] })
		]);
		const records = finality(state);
		expect(records.get(1000)?.ms).toBeNull();
		expect(records.get(1001)?.ms).toBeNull();
		expect(records.get(1002)?.ms).toBe(1100);
		expect(records.get(1002)?.by).toBe(1004);
		expect(records.has(1003)).toBe(false);
	});

	test('headline is the median of the last 20 timed final blocks', () => {
		const blocks = chain(1000, 1040).map((b) => (b.block_num > 1020 ? { ...b, latency: 300 } : b));
		const records = finality(apply(blocks));
		expect(headline(records)).toBe(1300);
		expect(headline(new Map())).toBeNull();
	});
});

describe('votes over threshold', () => {
	test('uses the policy of the QC generation and weights', () => {
		const state = apply([
			policy(),
			policy({
				generation: 2,
				threshold: 4,
				finalizers: [
					{ description: 'one', weight: 2, public_key: 'PUB_BLS_one' },
					{ description: 'five', weight: 3, public_key: 'PUB_BLS_five' }
				]
			})
		]);
		const qc = {
			block_num: 1,
			is_strong_qc: true,
			generation: 1,
			missing: [3],
			pending_generation: 2,
			pending_missing: [0]
		};
		expect(qcVotes(qc, state.policies)).toMatchObject({ votes: 3, threshold: 3, over: 0 });
		expect(pendingQcVotes(qc, state.policies)).toMatchObject({ votes: 3, total: 5, over: -1 });
		expect(qcVotes({ ...qc, generation: 9 }, state.policies)).toBeNull();
	});
});

describe('window stats', () => {
	test('counts QC exceptions', () => {
		const state = apply([
			policy(),
			schedule(['alpha']),
			block(1000),
			block(1001, { qc: { block_num: 1000, is_strong_qc: false, generation: 1 } }),
			block(1002, {
				qc_claim: { block_num: 1000, is_strong_qc: true },
				qc: { block_num: 1000, is_strong_qc: true, generation: 1 }
			}),
			block(1003, { qc: undefined, qc_claim: { block_num: 1000, is_strong_qc: true } }),
			block(1004)
		]);
		const stats = windowStats(state);
		expect(stats.weakQcs).toBe(1);
		expect(stats.qcLag).toBe(1);
		expect(stats.noQc).toBe(1);
	});

	test('producers follow schedule order with slots missed', () => {
		const producers = ['alpha', 'beta', 'gamma'];
		const slotTime = (slot: number) => slot * 500 + 946_684_800_000;
		const start = Math.ceil((T0 - 946_684_800_000) / 500 / 36) * 36;
		const blocks: BlockMessage[] = [];
		let num = 2000;
		for (let slot = start; slot < start + 36; slot++) {
			if (slot >= start + 12 && slot < start + 15) continue;
			blocks.push(
				block(num++, {
					timestamp: slotTime(slot),
					producer: producers[Math.floor((slot - start) / 12)],
					latency: slot - start
				})
			);
		}
		const state = apply([policy(), schedule(producers), ...blocks]);
		const stats = windowStats(state);
		expect(stats.producers.map((p) => p.producer)).toEqual(['alpha', 'beta', 'gamma']);
		expect(stats.missedSlots).toBe(3);
		expect(stats.producers.map((p) => p.missed)).toEqual([0, 3, 0]);
		expect(stats.producers.map((p) => p.blocks)).toEqual([12, 9, 12]);
	});

	test('producer latency max skips no_timing blocks', () => {
		const blocks = chain(1000, 1003).map((b, i) => ({
			...b,
			latency: [40, 190, -20, 900][i],
			no_timing: i === 3
		}));
		const stats = windowStats(apply([policy(), schedule(['alpha']), ...blocks]));
		expect(stats.producers[0]).toMatchObject({ latencyMax: 190 });
	});

	test('finalizers count once per QC, active policy first then pending-only keys', () => {
		const pending = {
			generation: 2,
			threshold: 2,
			finalizers: [
				{ description: 'two again', weight: 1, public_key: 'PUB_BLS_two' },
				{ description: 'five', weight: 1, public_key: 'PUB_BLS_five' }
			]
		};
		const state = apply([
			policy({ pending }),
			schedule(['alpha']),
			block(1000, {
				qc: {
					block_num: 999,
					is_strong_qc: true,
					generation: 1,
					missing: [1],
					weak: [2],
					pending_generation: 2,
					pending_missing: [1]
				}
			}),
			block(1001)
		]);
		const stats = windowStats(state);
		expect(stats.finalizers.map((f) => [f.description, f.pending])).toEqual([
			['one', false],
			['two again', false],
			['three', false],
			['four', false],
			['five', true]
		]);
		const byKey = new Map(stats.finalizers.map((f) => [f.public_key, f]));
		expect(byKey.get('PUB_BLS_two')).toMatchObject({ qcs: 2, missing: 1, lastVote: 1000 });
		expect(byKey.get('PUB_BLS_three')).toMatchObject({ qcs: 2, weak: 1, lastVote: 1000 });
		expect(byKey.get('PUB_BLS_five')).toMatchObject({ qcs: 1, missing: 1, lastVote: null });
		expect(byKey.get('PUB_BLS_one')?.behind).toBe(1);
	});

	test('finalizer row marked past its own baseline once covered', () => {
		const qcs = FINALIZER_COVERAGE_QCS;
		const missing = (num: number) => (num % 2 ? [0] : []);
		const blocks = chain(1000, 1040).map((b) => ({
			...b,
			qc: { ...b.qc!, missing: missing(b.block_num) }
		}));
		const entry = { public_key: 'PUB_BLS_one', qcs, missing: 7, weak: 0 };
		const covered = apply([policy(), baseline({ finalizers: [entry] }), ...blocks]);
		expect(windowStats(covered).finalizers[0].marked).toBe(true);
		const building = apply([
			policy(),
			baseline({ finalizers: [{ ...entry, qcs: qcs - 1 }] }),
			...blocks
		]);
		expect(windowStats(building).finalizers[0].marked).toBe(false);
	});
});

describe('stage readings', () => {
	function statuses(state: FinalityState, reconnecting = false): Record<string, string> {
		return Object.fromEntries(
			stageReadings(state, windowStats(state), { reconnecting }).map((r) => [r.stage, r.status])
		);
	}

	test('normal when every stage is within its rule', () => {
		expect(statuses(healthy())).toEqual({
			production: 'normal',
			latency: 'normal',
			votes: 'normal',
			qc: 'normal',
			final: 'normal'
		});
	});

	test('production departs on a missed slot or a fork', () => {
		const gap = block(1041, { timestamp: block(1040).timestamp + 1000 });
		expect(statuses(healthy([gap])).production).toBe('departure');
		const fork = span('production-1030', { reason: 'fork', end: block(1030).timestamp });
		const state = healthy([fork]);
		expect(statuses(state).production).toBe('departure');
		expect(stageReadings(state, windowStats(state))[0]).toMatchObject({ figure: 0, forks: 1 });
	});

	test('latency and final read above baseline past the baseline p99', () => {
		const state = healthy([block(1041, { latency: 900 }), block(1042, { latency: 900 })]);
		const result = statuses(apply([baseline({ latency_p99: 50, time_to_final_p99: 1050 })], state));
		expect(result.latency).toBe('above_baseline');
		expect(result.final).toBe('above_baseline');
	});

	test('latency and final read building below 60 min of baseline', () => {
		const state = apply([baseline({ minutes: 59 })], healthy());
		expect(statuses(state).latency).toBe('building');
		expect(statuses(state).final).toBe('building');
	});

	test('votes depart on a QC at threshold', () => {
		const atThreshold = block(1041, {
			qc: { block_num: 1040, is_strong_qc: true, generation: 1, missing: [0] }
		});
		const state = healthy([atThreshold]);
		expect(statuses(state).votes).toBe('departure');
		expect(stageReadings(state, windowStats(state))[2].figure).toBe(0);
	});

	test('votes stay normal when only a finalizer row is marked', () => {
		const qcs = FINALIZER_COVERAGE_QCS;
		const blocks = chain(1000, 1040).map((b) => ({
			...b,
			qc: { ...b.qc!, missing: b.block_num % 2 ? [0] : [] }
		}));
		const entry = { public_key: 'PUB_BLS_one', qcs, missing: 7, weak: 0 };
		const state = apply([policy({ threshold: 2 }), baseline({ finalizers: [entry] }), ...blocks]);
		expect(windowStats(state).finalizers[0].marked).toBe(true);
		expect(statuses(state).votes).toBe('normal');
	});

	test('qc departs on any exception', () => {
		const weak = block(1041, { qc: { block_num: 1040, is_strong_qc: false, generation: 1 } });
		expect(statuses(healthy([weak])).qc).toBe('departure');
	});

	test('every stage reads no data while paused, reconnecting, or empty', () => {
		const paused = healthy([
			{ type: 'feed', state: 'paused', last_block: 1040, last_block_time: T0 }
		]);
		const noData = {
			production: 'no_data',
			latency: 'no_data',
			votes: 'no_data',
			qc: 'no_data',
			final: 'no_data'
		};
		expect(statuses(paused)).toEqual(noData);
		expect(statuses(healthy(), true)).toEqual(noData);
		expect(statuses(emptyState())).toEqual(noData);
	});
});
