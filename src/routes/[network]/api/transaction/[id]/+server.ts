import { error, json, type RequestEvent } from '@sveltejs/kit';
import type { API } from '@wharfkit/antelope';

import { getBackendNetwork } from '$lib/wharf/client/ssr';
import { getCacheHeaders } from '$lib/utils';
import { getChainDefinitionFromParams } from '$lib/wharf/chains';

export async function GET({ fetch, params }: RequestEvent) {
	const chain = getChainDefinitionFromParams(String(params.network));
	if (!chain) {
		return json({ error: 'Invalid chain specified' }, { status: 400 });
	}

	const network = getBackendNetwork(chain, fetch, true);
	let transaction: API.v1.GetTransactionResponse;
	try {
		transaction = await network.client.v1.history.get_transaction(String(params.id));
	} catch (e) {
		return error(500, {
			message: `Error while loading transaction ${params.id}: ${e}.`
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
