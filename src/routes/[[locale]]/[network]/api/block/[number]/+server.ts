import { json, type RequestEvent } from '@sveltejs/kit';

import { UInt64 } from '@wharfkit/antelope';
import { getCacheHeaders } from '$lib/utils';

export async function GET({ locals: { network }, params }: RequestEvent) {
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
