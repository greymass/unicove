import { json } from '@sveltejs/kit';

import { getChainDefinitionFromParams, getNetwork } from '$lib/state/network.svelte';
import { UInt64 } from '@wharfkit/antelope';

export async function GET({ fetch, params }) {
	const chain = getChainDefinitionFromParams(params.network);
	if (!chain) {
		return json({ error: 'Invalid chain specified' }, { status: 400 });
	}

	const network = getNetwork(chain, fetch);
	const [info, block] = await Promise.all([
		network.client.v1.chain.get_info(),
		network.client.call({
			method: 'POST',
			path: '/v1/chain/get_block',
			params: {
				block_num_or_id: params.number
			}
		})
	]);

	// Maintain a 5 second cache by default
	let cacheControl = 'public, max-age=5';

	// If the block is irreversible, cache for one year and mark immutable
	if (info.last_irreversible_block_num.gte(UInt64.from(params.number))) {
		cacheControl = 'public, max-age=31536000, immutable';
	}

	return json(
		{
			ts: new Date(),
			block
		},
		{
			headers: {
				'Cache-Control': cacheControl,
				'Cloudflare-CDN-Cache-Control': cacheControl
			}
		}
	);
}
