import { error, json } from '@sveltejs/kit';
import { Checksum256 } from '@wharfkit/antelope';

import type { RequestEvent } from './$types';
import { getCacheHeaders } from '$lib/utils';
import { getBackendClient } from '$lib/wharf/client/ssr';
import { TransactionResponse } from '$lib/types/transaction';

export async function GET({ fetch, locals, params }: RequestEvent) {
	let transaction: TransactionResponse;
	try {
		const client = getBackendClient(String(locals.network), fetch, { history: true });
		transaction = await client.call({
			path: '/v1/history/get_transaction',
			params: {
				id: Checksum256.from(params.id)
			},
			responseType: TransactionResponse
		});
	} catch (e) {
		return error(500, {
			message: `Error while loading transaction ${params.id}: ${e}.`
		});
	}

	const irreversible = transaction.last_irreversible_block.gte(transaction.block_num);
	const headers = getCacheHeaders(5, irreversible);
	return json(transaction, {
		headers
	});
}
