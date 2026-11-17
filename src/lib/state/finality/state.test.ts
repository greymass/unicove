import { describe, expect, test } from 'bun:test';
import { emptyState, reduce, type FinalityState } from './state';
import { T0, block, chain, policy, schedule, span } from './testdata';
import type { Message } from './v1';

function apply(messages: Message[], state: FinalityState = emptyState()): FinalityState {
	return messages.reduce(reduce, state);
}

const hello: Message = {
	type: 'hello',
	v: 1,
	network: 'jungle4',
	generation: 1,
	schedule_version: 1
};

describe('reduce', () => {
	test('snapshot then live blocks', () => {
		const snapshot = apply([
			hello,
			policy(),
			schedule(['alpha', 'beta']),
			...chain(1000, 1009),
			{ type: 'snapshot_end' }
		]);
		expect(snapshot.ready).toBe(true);
		expect(snapshot.hello?.network).toBe('jungle4');
		expect(snapshot.policies.get(1)?.threshold).toBe(3);
		expect(snapshot.schedules.get(1)?.producers).toEqual(['alpha', 'beta']);
		expect(snapshot.blocks.map((b) => b.block_num)).toEqual(
			chain(1000, 1009).map((b) => b.block_num)
		);
		const live = apply(chain(1010, 1011), snapshot);
		expect(live.blocks).toHaveLength(12);
		expect(live.lastBlockNum).toBe(1011);
		expect(live.blockIndex.get(1011)?.id).toBe('id-1011');
	});

	test('keeps blocks sorted when one arrives out of order', () => {
		const state = apply([block(1002), block(1000), block(1001)]);
		expect(state.blocks.map((b) => b.block_num)).toEqual([1000, 1001, 1002]);
		expect(state.lastBlockNum).toBe(1002);
	});

	test('prunes the live window by the newest timestamp across a jump', () => {
		const before = apply(chain(1000, 1239));
		expect(before.blocks).toHaveLength(240);
		const jumped = reduce(before, block(1240, { timestamp: T0 + 600_000 }));
		expect(jumped.blocks.map((b) => b.block_num)).toEqual([1240]);
		expect(jumped.blockIndex.has(1239)).toBe(false);
	});

	test('drops blocks older than 120 s before the newest', () => {
		const state = apply(chain(1000, 1300));
		const oldest = state.blocks[0];
		const newest = state.blocks[state.blocks.length - 1];
		expect(newest.timestamp - oldest.timestamp).toBe(120_000);
		expect(oldest.block_num).toBe(1060);
	});

	test('a fork drops the dropped ids and the replacements upsert', () => {
		const state = apply([
			...chain(1000, 1005),
			{ type: 'fork', block_num: 1004, depth: 2, dropped: ['id-1004', 'id-1005'] }
		]);
		expect(state.blocks.map((b) => b.block_num)).toEqual([1000, 1001, 1002, 1003]);
		expect(state.lastBlockNum).toBe(1003);
		const replaced = apply(
			[block(1004, { id: 'fork-1004', producer: 'beta' }), block(1005, { id: 'fork-1005' })],
			state
		);
		expect(replaced.blockIndex.get(1004)?.id).toBe('fork-1004');
		expect(replaced.blockIndex.get(1004)?.producer).toBe('beta');
		expect(replaced.blocks).toHaveLength(6);
	});

	test('a block at a held number replaces it', () => {
		const state = apply([...chain(1000, 1002), block(1002, { id: 'other' })]);
		expect(state.blocks).toHaveLength(3);
		expect(state.blockIndex.get(1002)?.id).toBe('other');
	});

	test('spans upsert by id and prune 24 h after they end', () => {
		const day = 24 * 60 * 60 * 1000;
		let state = apply([
			span('production-1000', { open: true, end: T0 + 500 }),
			span('qc-1001', { stage: 'qc', reason: 'weak_qc', end: T0 + 1000 }),
			span('production-1000', { open: false, end: T0 + 2000, blocks: 5 })
		]);
		expect(state.spans.size).toBe(2);
		expect(state.spans.get('production-1000')?.blocks).toBe(5);
		state = reduce(state, block(1000, { timestamp: T0 + day + 1500 }));
		expect([...state.spans.keys()]).toEqual(['production-1000']);
		state = reduce(state, block(1001, { timestamp: T0 + day + 2500 }));
		expect(state.spans.size).toBe(0);
	});

	test('open spans survive pruning', () => {
		const state = apply([
			span('feed-1', { stage: 'feed', reason: 'feed_paused', open: true }),
			block(1000, { timestamp: T0 + 2 * 24 * 60 * 60 * 1000 })
		]);
		expect(state.spans.has('feed-1')).toBe(true);
	});

	test('keeps the last 15 minutes in order', () => {
		const minutes: Message[] = [];
		for (let i = 20; i >= 0; i--) {
			minutes.push({
				type: 'minute',
				minute: T0 + i * 60_000,
				time_to_final_p90: 1500,
				blocks: 120,
				missed_slot: 0,
				fork: 0,
				weak_qc: 0,
				no_qc: 0,
				qc_lag: 0
			});
		}
		const state = apply(minutes);
		expect(state.minutes).toHaveLength(15);
		expect(state.minutes[0].minute).toBe(T0 + 6 * 60_000);
		expect(state.minutes[14].minute).toBe(T0 + 20 * 60_000);
	});

	test('policy keeps every generation and the newest as current', () => {
		const pending = { generation: 2, threshold: 2, finalizers: [] };
		const state = apply([policy({ pending }), policy({ generation: 0 })]);
		expect(state.policy?.generation).toBe(1);
		expect(state.policies.get(2)?.threshold).toBe(2);
		expect(state.policies.get(0)).toBeDefined();
	});

	test('feed and baseline replace', () => {
		const state = apply([
			{ type: 'feed', state: 'paused', last_block: 1000, last_block_time: T0 },
			{ type: 'feed', state: 'live', last_block: 1001, last_block_time: T0 + 500 }
		]);
		expect(state.feed?.state).toBe('live');
	});

	test('unknown messages and fields pass through', () => {
		const state = apply(chain(1000, 1001));
		const unknown = { type: 'surprise', value: 1 } as unknown as Message;
		expect(reduce(state, unknown)).toBe(state);
		const extra = { ...block(1002), extra: 'kept' } as Message;
		const next = reduce(state, extra);
		expect((next.blockIndex.get(1002) as unknown as { extra: string }).extra).toBe('kept');
	});
});
