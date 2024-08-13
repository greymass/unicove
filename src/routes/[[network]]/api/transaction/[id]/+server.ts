import { error, json } from '@sveltejs/kit';

import { getChainDefinitionFromParams, getNetwork } from '$lib/state/network.svelte';
import { getBackendClient } from '$lib/wharf/client/ssr';
import type { API } from '@wharfkit/antelope';
import { getCacheHeaders } from '$lib/utils';

export async function GET({ fetch, params }) {
	const chain = getChainDefinitionFromParams(params.network);
	if (!chain) {
		return json({ error: 'Invalid chain specified' }, { status: 400 });
	}

	const network = getNetwork(chain, fetch);
	const client = getBackendClient(fetch, network.shortname, {
		history: true
	});
	let transaction: API.v1.GetTransactionResponse;
	try {
		transaction = await client.v1.history.get_transaction(params.id);
	} catch (e) {
		return error(500, {
			message: `Error while loading account ${params.id}: ${e}.`
		});
	}

	const irreversible = transaction.last_irreversible_block.gte(transaction.block_num);
	const headers = getCacheHeaders(5, irreversible);

	return json(
		{
			ts: new Date(),
			transaction
		},
		{
			headers
		}
	);
}
