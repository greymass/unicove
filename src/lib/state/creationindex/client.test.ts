import { describe, expect, test } from 'bun:test';
import { CreationindexClient, CreationindexError, isCreationindexRoute } from './client';

function recorder(body: unknown, status = 200) {
	const urls: string[] = [];
	const fetchFn = (async (input: string) => {
		urls.push(input);
		return new Response(JSON.stringify(body), { status });
	}) as unknown as typeof fetch;
	return { urls, client: new CreationindexClient('/jungle4/api/creationindex', fetchFn) };
}

describe('isCreationindexRoute', () => {
	test('accepts every service route', () => {
		expect(isCreationindexRoute('get_creation')).toBe(true);
		expect(isCreationindexRoute('health')).toBe(true);
	});

	test('rejects other names and paths', () => {
		expect(isCreationindexRoute('get_account')).toBe(false);
		expect(isCreationindexRoute('get_creation/../health')).toBe(false);
	});
});

describe('CreationindexClient', () => {
	test('builds the route URL with its parameters', async () => {
		const { urls, client } = recorder({ creator: 'gm', days: [] });
		await client.getDaily('2026-10-19', '2026-10-20', 'gm');
		expect(urls[0]).toBe(
			'/jungle4/api/creationindex/get_daily?from=2026-10-19&to=2026-10-20&creator=gm'
		);
	});

	test('omits unset parameters', async () => {
		const { urls, client } = recorder({ days: [] });
		await client.getDaily('2026-10-19', '2026-10-20');
		await client.getEndowment();
		expect(urls[0]).toBe('/jungle4/api/creationindex/get_daily?from=2026-10-19&to=2026-10-20');
		expect(urls[1]).toBe('/jungle4/api/creationindex/get_endowment');
	});

	test('passes filters and paging together', async () => {
		const { urls, client } = recorder({ events: [], more: false, next: 0 });
		await client.getProgramEvents({ type: 'return', program_creator: 'gm' }, { after: 396535542 });
		await client.getCreations({ program_creator: 'gm' }, { limit: 2 });
		expect(urls[0]).toBe(
			'/jungle4/api/creationindex/get_program_events?type=return&program_creator=gm&after=396535542'
		);
		expect(urls[1]).toBe('/jungle4/api/creationindex/get_creations?program_creator=gm&limit=2');
	});

	test('returns the response body', async () => {
		const endowment = {
			program_account: 'gift.gm',
			ram_quota: 1223399,
			ram_usage: 217768,
			available_bytes: 1005631,
			read_at: '2026-10-21T01:28:25.000Z'
		};
		const { client } = recorder(endowment);
		expect(await client.getEndowment()).toEqual(endowment);
	});

	test('raises the service error message with its status', async () => {
		const { client } = recorder({ error: 'account not found' }, 404);
		const err = await client.getCreation('nobody').catch((e) => e);
		expect(err).toBeInstanceOf(CreationindexError);
		expect(err.message).toBe('account not found');
		expect(err.status).toBe(404);
	});

	test('raises status 0 when the service is unreachable', async () => {
		const client = new CreationindexClient('/api', (async () => {
			throw new TypeError('fetch failed');
		}) as unknown as typeof fetch);
		const err = await client.getHealth().catch((e) => e);
		expect(err).toBeInstanceOf(CreationindexError);
		expect(err.status).toBe(0);
	});
});
