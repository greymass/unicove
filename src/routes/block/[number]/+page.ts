import { error } from '@sveltejs/kit';

import type { PageLoad } from './$types';
import * as m from '$lib/paraglide/messages.js';
import { getClient } from '$lib/wharf/client';

export const load: PageLoad = async ({ fetch, params }) => {
	if (params.number) {
		const block = await getClient(fetch).v1.chain.get_block(params.number);
		const description = m.block_height_numbered_description({
			height: params.number,
			producer: String(block.producer),
			timestamp: block.timestamp.toDate(),
			transactions: block.transactions.length,
			actions: block.transactions.reduce((acc, tx) => acc + tx.trx.transaction.actions.length, 0)
		});
		const pageMetaTags = {
			title: m.block_height_numbered({ height: params.number }),
			description
		};
		return {
			block,
			height: params.number,
			pageMetaTags,
			title: `Block ${params.number}`
		};
	}
	error(404, 'Not found');
};
