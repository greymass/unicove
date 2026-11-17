// Copied from finalitymonitor/contract/src/v1.ts
export const VERSION = 1;

export type Stage = 'production' | 'latency' | 'votes' | 'qc' | 'final' | 'feed';

export type Reason =
	| 'missed_slot'
	| 'fork'
	| 'latency'
	| 'votes_at_threshold'
	| 'weak_qc'
	| 'no_qc'
	| 'qc_lag'
	| 'time_to_final'
	| 'feed_paused'
	| 'no_timing';

export type FeedState = 'live' | 'paused' | 'catching_up';

export interface QcClaim {
	block_num: number;
	is_strong_qc: boolean;
}

export interface Qc {
	block_num: number;
	is_strong_qc: boolean;
	generation: number;
	missing?: number[];
	weak?: number[];
	pending_generation?: number;
	pending_missing?: number[];
	pending_weak?: number[];
}

export interface FinalizerAuthority {
	description: string;
	weight: number;
	public_key: string;
}

export interface FinalizerPolicy {
	generation: number;
	threshold: number;
	finalizers: FinalizerAuthority[];
}

export interface HelloMessage {
	type: 'hello';
	v: number;
	network: string;
	generation: number;
	schedule_version: number;
	resumed?: boolean;
}

export interface PolicyMessage extends FinalizerPolicy {
	type: 'policy';
	pending?: FinalizerPolicy;
}

export interface ScheduleMessage {
	type: 'schedule';
	version: number;
	producers: string[];
}

export interface BaselineFinalizer {
	public_key: string;
	qcs: number;
	missing: number;
	weak: number;
}

export interface BaselineProducer {
	producer: string;
	blocks: number;
	missed: number;
	qc_blocks: number;
	at_threshold: number;
	votes_over_threshold_p50: number | null;
}

export interface BaselineGridCell {
	public_key: string;
	producer: string;
	qcs: number;
	missing: number;
}

export interface BaselineMessage {
	type: 'baseline';
	from: number;
	to: number;
	minutes: number;
	time_to_final_p50: number | null;
	time_to_final_p99: number | null;
	latency_p99: number | null;
	// low-side p99: the 1st percentile of votes over threshold
	votes_over_threshold_p1: number | null;
	finalizers: BaselineFinalizer[];
	producers: BaselineProducer[];
	grid: BaselineGridCell[];
}

export interface MinuteMessage {
	type: 'minute';
	minute: number;
	time_to_final_p90: number | null;
	blocks: number;
	missed_slot: number;
	fork: number;
	weak_qc: number;
	no_qc: number;
	qc_lag: number;
}

export interface SpanMessage {
	type: 'span';
	id: string;
	stage: Stage;
	reason: Reason;
	start: number;
	end: number;
	from: number;
	to: number;
	blocks: number;
	open: boolean;
}

export interface FeedMessage {
	type: 'feed';
	state: FeedState;
	last_block: number | null;
	last_block_time: number | null;
}

export interface ForkMessage {
	type: 'fork';
	block_num: number;
	depth: number;
	dropped: string[];
}

export interface BlockMessage {
	type: 'block';
	block_num: number;
	id: string;
	previous: string;
	timestamp: number;
	producer: string;
	latency: number;
	schedule_version: number;
	qc_claim: QcClaim;
	qc?: Qc;
	final?: [number, number];
	no_timing?: boolean;
	catching_up?: boolean;
}

export interface SnapshotEndMessage {
	type: 'snapshot_end';
}

export interface ResumeMessage {
	type: 'resume';
	block_num: number;
	id: string;
}

export type Message =
	| HelloMessage
	| PolicyMessage
	| ScheduleMessage
	| BaselineMessage
	| MinuteMessage
	| SpanMessage
	| FeedMessage
	| ForkMessage
	| BlockMessage
	| SnapshotEndMessage
	| ResumeMessage;

export type IngestMessage = PolicyMessage | ScheduleMessage | ForkMessage | BlockMessage;
