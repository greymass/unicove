// Copied from finalitymonitor/contract/src/final.ts
import type { BlockMessage } from './v1.ts';

type FinalInput = Pick<BlockMessage, 'block_num' | 'timestamp' | 'latency' | 'final' | 'no_timing'>;

export function finalizedBy<T extends FinalInput>(blocks: readonly T[]): Map<number, T> {
	const held = new Set(blocks.map((block) => block.block_num));
	const result = new Map<number, T>();
	for (const block of blocks) {
		if (!block.final) continue;
		const [from, to] = block.final;
		for (let num = from; num <= to; num++) {
			if (held.has(num)) result.set(num, block);
		}
	}
	return result;
}

export function timeToFinal(blocks: readonly FinalInput[]): Map<number, number | null> {
	const byNum = new Map(blocks.map((block) => [block.block_num, block]));
	const result = new Map<number, number | null>();
	for (const [num, finalizer] of finalizedBy(blocks)) {
		const block = byNum.get(num);
		if (!block) continue;
		result.set(
			num,
			finalizer.no_timing ? null : finalizer.timestamp + finalizer.latency - block.timestamp
		);
	}
	return result;
}
