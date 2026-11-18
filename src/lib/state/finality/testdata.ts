import type { BlockMessage, PolicyMessage, ScheduleMessage, SpanMessage } from './v1';

export const T0 = Date.UTC(2026, 10, 17, 12, 0, 0);

export function block(num: number, overrides: Partial<BlockMessage> = {}): BlockMessage {
	return {
		type: 'block',
		block_num: num,
		id: `id-${num}`,
		previous: `id-${num - 1}`,
		timestamp: T0 + (num - 1000) * 500,
		producer: 'alpha',
		latency: 100,
		schedule_version: 1,
		qc_claim: { block_num: num - 1, is_strong_qc: true },
		qc: { block_num: num - 1, is_strong_qc: true, generation: 1 },
		final: [num - 2, num - 2],
		...overrides
	};
}

export function chain(from: number, to: number): BlockMessage[] {
	const blocks: BlockMessage[] = [];
	for (let num = from; num <= to; num++) blocks.push(block(num));
	return blocks;
}

export function policy(overrides: Partial<PolicyMessage> = {}): PolicyMessage {
	return {
		type: 'policy',
		generation: 1,
		threshold: 3,
		finalizers: [
			{ description: 'one', weight: 1, public_key: 'PUB_BLS_one' },
			{ description: 'two', weight: 1, public_key: 'PUB_BLS_two' },
			{ description: 'three', weight: 1, public_key: 'PUB_BLS_three' },
			{ description: 'four', weight: 1, public_key: 'PUB_BLS_four' }
		],
		...overrides
	};
}

export function schedule(producers: string[], version = 1): ScheduleMessage {
	return { type: 'schedule', version, producers };
}

export function span(id: string, overrides: Partial<SpanMessage> = {}): SpanMessage {
	return {
		type: 'span',
		id,
		stage: 'production',
		reason: 'missed_slot',
		start: T0,
		end: T0 + 1000,
		from: 1000,
		to: 1002,
		blocks: 3,
		open: false,
		...overrides
	};
}
