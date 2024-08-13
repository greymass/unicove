import type { Load } from '@sveltejs/kit';
import * as m from '$lib/paraglide/messages.js';
import { API, TimePointSec } from '@wharfkit/antelope';

export const load: Load = async ({ fetch, params }) => {
	const response = await fetch(`/${params.network}/api/block/${params.number}`);
	const json = await response.json();
	const block = json.block;
	// Create metadata for the page
	const actions = block.transactions.reduce((acc, tx) => {
		if (!tx.trx.transaction) {
			return acc;
		}
		return acc + tx.trx.transaction.actions.length;
	}, 0);
	const description = m.block_height_numbered_description({
		height: String(params.number),
		producer: block.producer,
		timestamp: TimePointSec.from(block.timestamp).toDate(),
		transactions: block.transactions.length,
		actions
	});
	return {
		block,
		network: params.network,
		id: params.id,
		seq: params.seq,
		pageMetaTags: {
			title: m.block_height_numbered({ height: params.number }),
			description
		}
	};
};
