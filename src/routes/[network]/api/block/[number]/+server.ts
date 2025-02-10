import { json, type RequestEvent } from '@sveltejs/kit';

import { UInt64 } from '@wharfkit/antelope';
import { getCacheHeaders } from '$lib/utils';
import { getBackendNetwork } from '$lib/wharf/client/ssr.js';
import { getChainDefinitionFromParams } from '$lib/wharf/chains';

export async function GET({ fetch, params }: RequestEvent) {
	const chain = getChainDefinitionFromParams(String(params.network));
	if (!chain) {
		return json({ error: 'Invalid chain specified' }, { status: 400 });
	}

	const network = getBackendNetwork(chain, fetch);
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

	const irreversible = info.last_irreversible_block_num.gte(UInt64.from(params.number));

	return json(
		{
			ts: new Date(),
			block
		},
		{
			headers: getCacheHeaders(5, irreversible)
		}
	);
}
