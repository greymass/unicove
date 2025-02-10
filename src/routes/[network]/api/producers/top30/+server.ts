import { json, type RequestEvent } from '@sveltejs/kit';

import { getCacheHeaders } from '$lib/utils';
import { getBackendNetwork } from '$lib/wharf/client/ssr';
import { getProducersRecursive } from '../utils';
import { getChainDefinitionFromParams } from '$lib/wharf/chains';

export async function GET({ fetch, params }: RequestEvent) {
	const chain = getChainDefinitionFromParams(String(params.network));
	if (!chain) {
		return json({ error: 'Invalid chain specified' }, { status: 400 });
	}

	const network = getBackendNetwork(chain, fetch);

	const all = await getProducersRecursive(network);
	const producers = all
		.sort((a, b) => Number(b.total_votes) - Number(a.total_votes))
		.slice(0, 30)
		.map((p) => p.owner);

	const headers = getCacheHeaders(600);

	return json(
		{
			ts: new Date(),
			producers
		},
		{
			headers
		}
	);
}
