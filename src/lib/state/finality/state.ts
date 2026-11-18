import type {
	BaselineMessage,
	BlockMessage,
	FeedMessage,
	FinalizerPolicy,
	HelloMessage,
	Message,
	MinuteMessage,
	PolicyMessage,
	ScheduleMessage,
	SpanMessage
} from './v1';

export const LIVE_WINDOW_MS = 120_000;
export const SPAN_WINDOW_MS = 24 * 60 * 60 * 1000;
export const MINUTES_HELD = 15;

export interface FinalityState {
	hello: HelloMessage | null;
	policy: PolicyMessage | null;
	policies: ReadonlyMap<number, FinalizerPolicy>;
	schedules: ReadonlyMap<number, ScheduleMessage>;
	baseline: BaselineMessage | null;
	minutes: readonly MinuteMessage[];
	spans: ReadonlyMap<string, SpanMessage>;
	blocks: readonly BlockMessage[];
	blockIndex: ReadonlyMap<number, BlockMessage>;
	feed: FeedMessage | null;
	ready: boolean;
	lastBlockNum: number | null;
}

export function emptyState(): FinalityState {
	return {
		hello: null,
		policy: null,
		policies: new Map(),
		schedules: new Map(),
		baseline: null,
		minutes: [],
		spans: new Map(),
		blocks: [],
		blockIndex: new Map(),
		feed: null,
		ready: false,
		lastBlockNum: null
	};
}

export function reduce(state: FinalityState, message: Message): FinalityState {
	switch (message.type) {
		case 'hello':
			return { ...state, hello: message };
		case 'policy':
			return applyPolicy(state, message);
		case 'schedule': {
			const schedules = new Map(state.schedules);
			schedules.set(message.version, message);
			return { ...state, schedules };
		}
		case 'baseline':
			return { ...state, baseline: message };
		case 'minute': {
			const minutes = state.minutes.filter((row) => row.minute !== message.minute);
			minutes.push(message);
			minutes.sort((a, b) => a.minute - b.minute);
			return { ...state, minutes: minutes.slice(-MINUTES_HELD) };
		}
		case 'span': {
			const spans = new Map(state.spans);
			spans.set(message.id, message);
			return { ...state, spans: pruneSpans(spans, newestTimestamp(state.blocks)) };
		}
		case 'feed':
			return { ...state, feed: message };
		case 'fork': {
			const dropped = new Set(message.dropped);
			return withBlocks(
				state,
				state.blocks.filter((block) => !dropped.has(block.id))
			);
		}
		case 'block':
			return applyBlock(state, message);
		case 'snapshot_end':
			return { ...state, ready: true };
		default:
			return state;
	}
}

function applyPolicy(state: FinalityState, message: PolicyMessage): FinalityState {
	const policies = new Map(state.policies);
	if (message.pending && !policies.has(message.pending.generation)) {
		policies.set(message.pending.generation, message.pending);
	}
	policies.set(message.generation, {
		generation: message.generation,
		threshold: message.threshold,
		finalizers: message.finalizers
	});
	const policy =
		!state.policy || message.generation >= state.policy.generation ? message : state.policy;
	return { ...state, policy, policies };
}

function applyBlock(state: FinalityState, message: BlockMessage): FinalityState {
	const blocks = state.blocks.filter((block) => block.block_num !== message.block_num);
	let index = blocks.length;
	while (index > 0 && blocks[index - 1].block_num > message.block_num) index--;
	blocks.splice(index, 0, message);
	const newest = newestTimestamp(blocks)!;
	const live = blocks.filter((block) => block.timestamp >= newest - LIVE_WINDOW_MS);
	const next = withBlocks(state, live);
	return { ...next, spans: pruneSpans(state.spans, newest) };
}

function withBlocks(state: FinalityState, blocks: BlockMessage[]): FinalityState {
	return {
		...state,
		blocks,
		blockIndex: new Map(blocks.map((block) => [block.block_num, block])),
		lastBlockNum: blocks.length ? blocks[blocks.length - 1].block_num : state.lastBlockNum
	};
}

function newestTimestamp(blocks: readonly BlockMessage[]): number | null {
	let newest: number | null = null;
	for (const block of blocks) {
		if (newest === null || block.timestamp > newest) newest = block.timestamp;
	}
	return newest;
}

function pruneSpans(
	spans: ReadonlyMap<string, SpanMessage>,
	newest: number | null
): ReadonlyMap<string, SpanMessage> {
	if (newest === null) return spans;
	const cutoff = newest - SPAN_WINDOW_MS;
	let stale = false;
	for (const span of spans.values()) {
		if (!span.open && span.end < cutoff) stale = true;
	}
	if (!stale) return spans;
	return new Map([...spans].filter(([, span]) => span.open || span.end >= cutoff));
}
