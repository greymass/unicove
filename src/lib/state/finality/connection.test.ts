import { describe, expect, test } from 'bun:test';
import { BACKOFF_MAX_MS, backoffDelay, feedUrl } from './connection';

describe('feedUrl', () => {
	test('first connection has no resume point', () => {
		expect(feedUrl('wss://finality.unicove.com', 'jungle4', null)).toBe(
			'wss://finality.unicove.com/v1/jungle4'
		);
	});

	test('reconnects resume from the last block', () => {
		expect(feedUrl('ws://localhost:8787/', 'jungle4', 1234)).toBe(
			'ws://localhost:8787/v1/jungle4?from=1234'
		);
	});
});

describe('backoffDelay', () => {
	test('doubles from 0.5 s to a 15 s cap', () => {
		expect([0, 1, 2, 3, 4, 5, 6].map((attempt) => backoffDelay(attempt, 0))).toEqual([
			500, 1000, 2000, 4000, 8000, 15000, 15000
		]);
	});

	test('adds up to 30% jitter', () => {
		expect(backoffDelay(0, 1)).toBe(650);
		expect(backoffDelay(10, 1)).toBe(BACKOFF_MAX_MS * 1.3);
	});
});
