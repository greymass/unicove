import type { Load } from '@sveltejs/kit';
import * as m from '$lib/paraglide/messages.js';
import { API, TimePointSec, Transaction } from '@wharfkit/antelope';
import { languageTag } from '$lib/paraglide/runtime';

export const load: Load = async ({ fetch, params, parent }) => {
	const { network } = await parent();
	const response = await fetch(`/${params.network}/api/block/${params.number}`);
	const json = await response.json();
	const block = json.block as API.v1.GetBlockResponse;
	// Create metadata for the page
	const actions = block.transactions.reduce(
		(acc: number, tx: { trx: { transaction?: Transaction } }) => {
			if (!tx.trx.transaction) {
				return acc;
			}
			return acc + tx.trx.transaction.actions.length;
		},
		0
	);
	const date = TimePointSec.from(block.timestamp).toDate();
	const description = m.block_height_numbered_description({
		height: String(params.number),
		producer: block.producer,
		timestamp: date,
		transactions: block.transactions.length,
		actions
	});

	const title = m.block_height_numbered({ height: Number(params.number) });

	return {
		number: params.number,
		title,
		subtitle: date.toLocaleString(languageTag()),
		block,
		actions,
		network: params.network,
		height: Number(params.number),
		pageMetaTags: {
			title: `${title} | ${network.chain.name} Network`,
			description
		}
	};
};
