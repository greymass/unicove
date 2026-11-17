import { describe, expect, test } from 'bun:test';
import {
	FINALIZER_COVERAGE_QCS,
	binomialQuantile,
	finalizerRowMarked,
	gridCellMarked,
	producerRowMarked
} from './markers';
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
});

describe('producer row marker', () => {
	test('marks latency p90 above the baseline latency p99', () => {
		expect(producerRowMarked(450, baseline())).toBe(true);
		expect(producerRowMarked(400, baseline())).toBe(false);
		expect(producerRowMarked(null, baseline())).toBe(false);
	});

	test('waits for 60 min of baseline', () => {
		expect(producerRowMarked(450, baseline({ minutes: 59 }))).toBe(false);
		expect(producerRowMarked(450, null)).toBe(false);
	});
});
