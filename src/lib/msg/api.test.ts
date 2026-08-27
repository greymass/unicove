import { describe, expect, test } from 'bun:test';
import { DiscussionUnavailable, chainDate, fetchMessages, fetchTagSummaries } from './api';

function fakeFetch(status: number, body: unknown, calls: string[]): typeof fetch {
	return (async (input: RequestInfo | URL) => {
		calls.push(String(input));
		return new Response(JSON.stringify(body), { status });
	}) as typeof fetch;
}

describe('fetchMessages', () => {
	test('builds the tuple query with cursors and omit_content', async () => {
		const calls: string[] = [];
		const result = await fetchMessages(
			fakeFetch(200, { messages: [], has_more: false }, calls),
			'/en/vaulta/api/msg',
			{
				tuple: ['msig', 'greymass', 'vp42'],
				limit: 50,
				after: 10,
				includeDeleted: true
			}
		);
		expect(result).toEqual({ messages: [], has_more: false });
		const url = new URL(calls[0], 'http://localhost');
		expect(url.pathname).toBe('/en/vaulta/api/msg/get_messages');
		expect(url.searchParams.get('channel')).toBe('governance');
		expect(url.searchParams.get('tags')).toBe('msig,greymass,vp42');
		expect(url.searchParams.get('limit')).toBe('50');
		expect(url.searchParams.get('after')).toBe('10');
		expect(url.searchParams.get('include_deleted')).toBe('true');
		expect(url.searchParams.get('omit_content')).toBe('true');
		expect(url.searchParams.has('before')).toBe(false);
	});
	test('keeps a falsy cursor value of zero', async () => {
		const calls: string[] = [];
		await fetchMessages(
			fakeFetch(200, { messages: [], has_more: false }, calls),
			'/en/vaulta/api/msg',
			{
				tuple: ['msig', 'a', 'b'],
				after: 0
			}
		);
		const url = new URL(calls[0], 'http://localhost');
		expect(url.searchParams.get('after')).toBe('0');
	});
	test('throws DiscussionUnavailable on 503', async () => {
		await expect(
			fetchMessages(fakeFetch(503, { message: 'x' }, []), '/en/vaulta/api/msg', {
				tuple: ['msig', 'a', 'b']
			})
		).rejects.toBeInstanceOf(DiscussionUnavailable);
	});
	test('throws a plain error on other failures', async () => {
		await expect(
			fetchMessages(fakeFetch(500, {}, []), '/en/vaulta/api/msg', { tuple: ['msig', 'a', 'b'] })
		).rejects.toThrow('500');
	});
});

describe('fetchTagSummaries', () => {
	test('repeats tags per tuple and returns summaries in order', async () => {
		const calls: string[] = [];
		const summaries = [
			{ tags: ['msig', 'a', 'b'], count: 2 },
			{ tags: ['topic', 'c', 'd'], count: 0 }
		];
		const result = await fetchTagSummaries(
			fakeFetch(200, { summaries }, calls),
			'/en/vaulta/api/msg',
			[
				['msig', 'a', 'b'],
				['topic', 'c', 'd']
			]
		);
		expect(result).toEqual(summaries);
		const url = new URL(calls[0], 'http://localhost');
		expect(url.searchParams.getAll('tags')).toEqual(['msig,a,b', 'topic,c,d']);
	});
	test('returns an empty list for no tuples without fetching', async () => {
		const calls: string[] = [];
		expect(await fetchTagSummaries(fakeFetch(200, {}, calls), '/x', [])).toEqual([]);
		expect(calls).toHaveLength(0);
	});
});

describe('chainDate', () => {
	test('treats zoneless timestamps as UTC', () => {
		expect(chainDate('2026-08-26T21:24:00.000').toISOString()).toBe('2026-08-26T21:24:00.000Z');
		expect(chainDate('2026-08-26T21:24:00Z').toISOString()).toBe('2026-08-26T21:24:00.000Z');
	});
});
