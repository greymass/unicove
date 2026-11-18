import { describe, expect, test } from 'bun:test';
import {
	FINALIZER_COVERAGE_QCS,
	binomialQuantile,
	finalizerChronic,
	finalizerRowMarked,
	flaggedFirst,
	gridCellMarked,
	latencyMarkedProducers
} from './markers';
import { block, span } from './testdata';
import type { BaselineMessage } from './v1';

function baseline(overrides: Partial<BaselineMessage> = {}): BaselineMessage {
	return {
		type: 'baseline',
		from: 0,
		to: 0,
		minutes: 1440,
		time_to_final_p50: 1300,
		time_to_final_p99: 1800,
		latency_p99: 400,
		votes_over_threshold_p1: 2,
		finalizers: [],
		producers: [],
		grid: [],
		...overrides
	};
}

describe('binomialQuantile', () => {
	test('p = 0 gives 0', () => {
		expect(binomialQuantile(240, 0, 0.99)).toBe(0);
	});

	test('p = 1 gives n', () => {
		expect(binomialQuantile(240, 1, 0.99)).toBe(240);
	});

	test('n = 240, p = 0.477 lands near mean plus 2.33 sd', () => {
		const k = binomialQuantile(240, 0.477, 0.99);
		expect(k).toBeGreaterThanOrEqual(130);
		expect(k).toBeLessThanOrEqual(135);
	});

	test('small known value', () => {
		// P(X <= 2) = 0.9298, P(X <= 3) = 0.9872, P(X <= 4) = 0.9984 for Binomial(10, 0.1)
		expect(binomialQuantile(10, 0.1, 0.99)).toBe(4);
		expect(binomialQuantile(10, 0.1, 0.95)).toBe(3);
	});

	test('stays finite for n = 200,000', () => {
		const k = binomialQuantile(200_000, 0.01, 0.99);
		expect(k).toBeGreaterThan(2000);
		expect(k).toBeLessThan(2120);
	});

	test('n = 0 gives 0', () => {
		expect(binomialQuantile(0, 0.5, 0.99)).toBe(0);
	});
});

describe('finalizer row marker', () => {
	const covered = { public_key: 'k', qcs: FINALIZER_COVERAGE_QCS, missing: 72, weak: 0 };
	const short = { ...covered, qcs: FINALIZER_COVERAGE_QCS - 1 };

	test('waits for 60 min of QCs on the key', () => {
		expect(finalizerRowMarked(200, 240, short)).toBe(false);
		expect(finalizerRowMarked(200, 240, undefined)).toBe(false);
		expect(finalizerRowMarked(200, 240, covered)).toBe(true);
	});

	test('marks only past the binomial p99 of its own rate', () => {
		const limit = binomialQuantile(240, 0.01, 0.99);
		expect(finalizerRowMarked(limit, 240, covered)).toBe(false);
		expect(finalizerRowMarked(limit + 1, 240, covered)).toBe(true);
	});

	test('splits the 1% across the rows tested', () => {
		const limit = binomialQuantile(240, 0.01, 1 - 0.01 / 21);
		expect(limit).toBeGreaterThan(binomialQuantile(240, 0.01, 0.99));
		expect(finalizerRowMarked(limit, 240, covered, 21)).toBe(false);
		expect(finalizerRowMarked(limit + 1, 240, covered, 21)).toBe(true);
	});
});

describe('grid cell marker', () => {
	const entry = { public_key: 'k', qcs: 10_000, missing: 100, weak: 0 };
	const cell = { public_key: 'k', producer: 'alpha', qcs: 500, missing: 20 };

	test('outlines a cell past the p99 at the finalizer rate', () => {
		expect(gridCellMarked(cell, entry)).toBe(true);
		expect(gridCellMarked({ ...cell, missing: 5 }, entry)).toBe(false);
	});

	test('waits for 60 min of QCs on the key', () => {
		expect(gridCellMarked(cell, { ...entry, qcs: 7_000 })).toBe(false);
	});

	test('splits the 1% across the cells tested', () => {
		const limit = binomialQuantile(500, 0.01, 1 - 0.01 / 441);
		expect(gridCellMarked({ ...cell, missing: limit }, entry, 441)).toBe(false);
		expect(gridCellMarked({ ...cell, missing: limit + 1 }, entry, 441)).toBe(true);
	});
});

describe('producer row marker', () => {
	const run = span('latency-1002', {
		stage: 'latency',
		reason: 'latency',
		from: 1002,
		to: 1006,
		blocks: 5
	});
	const blocks = [
		block(1001, { producer: 'alpha', latency: 900 }),
		block(1002, { producer: 'alpha', latency: 450 }),
		block(1004, { producer: 'beta', latency: 100 }),
		block(1006, { producer: 'gamma', latency: 450, no_timing: true })
	];

	test('marks producers of blocks over the latency p99 inside a latency span', () => {
		expect([...latencyMarkedProducers(blocks, [run], baseline())]).toEqual(['alpha']);
		expect(latencyMarkedProducers(blocks, [], baseline()).size).toBe(0);
	});

	test('waits for 60 min of baseline', () => {
		expect(latencyMarkedProducers(blocks, [run], baseline({ minutes: 59 })).size).toBe(0);
		expect(latencyMarkedProducers(blocks, [run], null).size).toBe(0);
	});
});

describe('chronic finalizer', () => {
	test('flags a covered 24 h missing share of 5% or more', () => {
		const entry = { public_key: 'k', qcs: FINALIZER_COVERAGE_QCS, missing: 0, weak: 0 };
		expect(finalizerChronic({ ...entry, missing: FINALIZER_COVERAGE_QCS * 0.05 })).toBe(true);
		expect(finalizerChronic({ ...entry, missing: FINALIZER_COVERAGE_QCS * 0.04 })).toBe(false);
		expect(finalizerChronic({ ...entry, qcs: 100, missing: 50 })).toBe(false);
		expect(finalizerChronic(undefined)).toBe(false);
	});
});

describe('flagged first', () => {
	test('moves flagged rows up and keeps order within each group', () => {
		expect(flaggedFirst([1, 2, 3, 4, 5], (n) => n % 2 === 0)).toEqual([2, 4, 1, 3, 5]);
	});
});
