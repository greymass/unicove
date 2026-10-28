import { describe, expect, test } from 'bun:test';
import type { CreationDay, CreationindexClient, DayCreator, KindsFigures } from './client';
import {
	addQuantities,
	emptyKinds,
	fillDays,
	loadDays,
	loadRanking,
	mergeRankings,
	monthlyDays,
	rangeChunks,
	sumTotals,
	windowRange
} from './origins';

const now = new Date('2026-10-22T15:30:00Z');

function kinds(buy: number, bytes: number | null, quantity: string | null = null): KindsFigures {
	return {
		...emptyKinds(),
		buy: {
			contributions: buy,
			bytes,
			without_bytes: bytes === null ? buy : 0,
			requested_bytes: null,
			quantity
		}
	};
}

function day(date: string, creations: number): CreationDay {
	return {
		day: date,
		creations,
		creations_without_ram: 0,
		kinds: kinds(creations, creations * 10)
	};
}

function creator(name: string, creations: number): DayCreator {
	return { creator: name, creations, creations_without_ram: 0, kinds: kinds(creations, null) };
}

describe('windowRange', () => {
	test('ends on the last complete day', () => {
		expect(windowRange('30d', now)).toEqual({ from: '2026-09-22', to: '2026-10-21' });
	});

	test('a year spans 365 days', () => {
		expect(windowRange('365d', now)).toEqual({ from: '2025-10-22', to: '2026-10-21' });
	});

	test('all time starts at the earliest chain', () => {
		expect(windowRange('all', now).from).toBe('2018-06-09');
	});
});

describe('rangeChunks', () => {
	test('keeps a range of up to 366 days whole', () => {
		expect(rangeChunks('2025-10-21', '2026-10-21')).toEqual([
			{ from: '2025-10-21', to: '2026-10-21' }
		]);
	});

	test('splits longer ranges into contiguous 366-day spans', () => {
		expect(rangeChunks('2025-10-20', '2026-10-21')).toEqual([
			{ from: '2025-10-20', to: '2026-10-20' },
			{ from: '2026-10-21', to: '2026-10-21' }
		]);
	});
});

describe('addQuantities', () => {
	test('adds at the asset precision without float drift', () => {
		expect(addQuantities('0.1000 EOS', '0.2000 EOS')).toBe('0.3000 EOS');
		expect(addQuantities('9.9999 EOS', '0.0001 EOS')).toBe('10.0000 EOS');
	});

	test('treats null as zero', () => {
		expect(addQuantities(null, '1.5000 EOS')).toBe('1.5000 EOS');
		expect(addQuantities(null, null)).toBeNull();
	});
});

describe('sumTotals', () => {
	test('keeps bytes null only while every row lacks them', () => {
		const none = sumTotals([day('2026-10-01', 0), day('2026-10-02', 0)].map(noBytes));
		expect(none.kinds.buy.bytes).toBeNull();
		const some = sumTotals([noBytes(day('2026-10-01', 2)), day('2026-10-02', 3)]);
		expect(some.kinds.buy.bytes).toBe(30);
		expect(some.kinds.buy.without_bytes).toBe(2);
		expect(some.creations).toBe(5);
	});
});

function noBytes(row: CreationDay): CreationDay {
	return { ...row, kinds: kinds(row.creations, null) };
}

describe('fillDays', () => {
	test('fills days with no creations with zeros', () => {
		const filled = fillDays([day('2026-10-02', 4)], '2026-10-01', '2026-10-03');
		expect(filled.map((d) => [d.day, d.creations])).toEqual([
			['2026-10-01', 0],
			['2026-10-02', 4],
			['2026-10-03', 0]
		]);
	});
});

describe('monthlyDays', () => {
	test('sums days into months and drops leading empty months', () => {
		const months = monthlyDays([
			day('2026-08-31', 0),
			day('2026-09-01', 2),
			day('2026-09-30', 3),
			day('2026-10-01', 0)
		]);
		expect(months.map((m) => [m.day, m.creations])).toEqual([
			['2026-09-01', 5],
			['2026-10-01', 0]
		]);
	});
});

describe('mergeRankings', () => {
	test('sums each creator across pages and ranks by creations', () => {
		const merged = mergeRankings(
			[
				[creator('gm', 10), creator('pcash', 8)],
				[creator('pcash', 5), creator('eosio', 1)]
			],
			2
		);
		expect(merged.map((row) => [row.creator, row.creations])).toEqual([
			['pcash', 13],
			['gm', 10]
		]);
	});
});

function fakeClient(calls: string[]): CreationindexClient {
	return {
		getDaily: async (from: string, to: string, name?: string) => {
			calls.push(`daily ${from} ${to} ${name ?? ''}`.trim());
			return { creator: name ?? '', days: [day(to, 1)] };
		},
		getCreators: async (from: string, to: string, page: { limit?: number } = {}) => {
			calls.push(`creators ${from} ${to} ${page.limit}`);
			return { from, to, creators: [creator('gm', 1)], more: false, offset: 0 };
		}
	} as unknown as CreationindexClient;
}

describe('loaders', () => {
	test('a window within the cap is one call per route', async () => {
		const calls: string[] = [];
		const client = fakeClient(calls);
		const days = await loadDays(client, '30d', 'gm', now);
		const ranking = await loadRanking(client, '30d', 10, now);
		expect(days).toHaveLength(30);
		expect(ranking).toHaveLength(1);
		expect(calls).toEqual(['daily 2026-09-22 2026-10-21 gm', 'creators 2026-09-22 2026-10-21 10']);
	});

	test('all time merges each span and ranks from a deeper page', async () => {
		const calls: string[] = [];
		const client = fakeClient(calls);
		const ranking = await loadRanking(client, 'all', 10, now);
		const spans = rangeChunks('2018-06-09', '2026-10-21').length;
		expect(calls).toHaveLength(spans);
		expect(calls.every((call) => call.endsWith(' 200'))).toBe(true);
		expect(ranking[0]).toMatchObject({ creator: 'gm', creations: spans });
	});
});
