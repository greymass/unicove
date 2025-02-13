import { error, json } from '@sveltejs/kit';
import type { API } from '@wharfkit/antelope';

import { getCacheHeaders } from '$lib/utils';
import { getBackendClient } from '$lib/wharf/client/ssr';
import type { RequestEvent } from './$types';

export async function GET({ locals, params }: RequestEvent) {
	let transaction: API.v1.GetTransactionResponse;
	try {
		const client = getBackendClient(String(locals.network), fetch, { history: true });
		transaction = await client.v1.history.get_transaction(String(params.id));
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
