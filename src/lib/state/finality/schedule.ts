import type { BlockMessage, ScheduleMessage } from './v1';

export const BLOCK_INTERVAL_MS = 500;
export const PRODUCER_REPETITIONS = 12;
export const BLOCK_TIMESTAMP_EPOCH_MS = 946_684_800_000;

export function slotOf(timestamp: number): number {
	return Math.floor((timestamp - BLOCK_TIMESTAMP_EPOCH_MS) / BLOCK_INTERVAL_MS);
}

export function slotOwner(slot: number, producers: readonly string[]): string | null {
	if (!producers.length) return null;
	return producers[Math.floor(slot / PRODUCER_REPETITIONS) % producers.length];
}

export interface MissedSlot {
	slot: number;
	owner: string | null;
	before: number;
}

export function missedSlots(
	blocks: readonly BlockMessage[],
	schedules: ReadonlyMap<number, ScheduleMessage>
): MissedSlot[] {
	const missed: MissedSlot[] = [];
	for (let i = 1; i < blocks.length; i++) {
		const previous = blocks[i - 1];
		const block = blocks[i];
		if (block.block_num !== previous.block_num + 1) continue;
		const producers = schedules.get(block.schedule_version)?.producers ?? [];
		for (let slot = slotOf(previous.timestamp) + 1; slot < slotOf(block.timestamp); slot++) {
			missed.push({ slot, owner: slotOwner(slot, producers), before: block.block_num });
		}
	}
	return missed;
}
