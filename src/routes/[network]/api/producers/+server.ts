import { json, type RequestEvent } from '@sveltejs/kit';

import { getCacheHeaders } from '$lib/utils';
import { getBackendNetwork } from '$lib/wharf/client/ssr';
import { getProducersRecursive } from './utils';
import { getChainDefinitionFromParams } from '$lib/wharf/chains';

export async function GET({ fetch, params }: RequestEvent) {
	const chain = getChainDefinitionFromParams(String(params.network));
	if (!chain) {
		return json({ error: 'Invalid chain specified' }, { status: 400 });
	}

	const network = getBackendNetwork(chain, fetch);

	const producers = await getProducersRecursive(network);
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
