import { json } from '@sveltejs/kit';
import { ContractKit } from '@wharfkit/contract';

import type { RequestEvent, RequestHandler } from './$types';

import { getCacheHeaders } from '$lib/utils';
import { getBackendNetwork } from '$lib/wharf/client/ssr';
import { getChainDefinitionFromParams } from '$lib/wharf/chains';

export const GET: RequestHandler = async ({ fetch, params, url }: RequestEvent) => {
	const chain = getChainDefinitionFromParams(String(params.network));
	if (!chain) {
		return json({ error: 'Invalid chain specified' }, { status: 400 });
	}

	const network = getBackendNetwork(chain, fetch);

	const kit = new ContractKit({ client: network.client });
	const contract = await kit.load(params.contract);

	const lower = url.searchParams.get('lower') || undefined;
	const upper = url.searchParams.get('upper') || undefined;
	const limit = url.searchParams.get('limit') || 10;

	const table = await contract.table(params.table, params.scope);
	const cursor = table.query({
		from: lower,
		to: upper
	});

	let rows = [];
	if (params.key) {
		rows = [await table.get(params.key)];
	} else {
		rows = await cursor.next(Number(limit));
	}

	try {
		const headers = getCacheHeaders(5);

		return json(
			{
				ts: new Date(),
				rows,
				next: cursor.nextkey
			},
			{ headers }
		);
	} catch (error) {
		console.error(error);
		return json({ error: 'Unable to load account.' }, { status: 500 });
	}
};
