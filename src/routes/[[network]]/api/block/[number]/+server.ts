import { json } from '@sveltejs/kit';

import { getChainDefinitionFromParams, getNetwork } from '$lib/state/network.svelte';
import { UInt64 } from '@wharfkit/antelope';
import { getCacheHeaders } from '$lib/utils';
import { getBackendClient } from '$lib/wharf/client/ssr.js';

export async function GET({ fetch, params, request }) {
	const cacheUrl = new URL(request.url);
	const cacheKey = new Request(cacheUrl.toString(), request);

	if (caches) {
		const cache = caches.default;
		const response = await cache.match(cacheKey);
		if (response) {
			return response;
		}
	}

	const chain = getChainDefinitionFromParams(params.network);
	if (!chain) {
		return json({ error: 'Invalid chain specified' }, { status: 400 });
	}

	const network = getNetwork(chain, fetch);
	const client = getBackendClient(fetch, network.shortname, {
		history: true,
		headers: {
			cacheEverything: true
		}
	});
	const [info, block] = await Promise.all([
		client.v1.chain.get_info(),
		client.call({
			method: 'POST',
			path: '/v1/chain/get_block',
			params: {
				block_num_or_id: params.number
			}
		})
	]);

	const irreversible = info.last_irreversible_block_num.gte(UInt64.from(params.number));

	const response = json(
		{
			ts: new Date(),
			block
		},
		{
			headers: getCacheHeaders(5, irreversible)
		}
	);

	if (caches && request.method === 'GET') {
		const cache = caches.default;
		await cache.put(cacheKey, response.clone());
	}

	return response;
}
