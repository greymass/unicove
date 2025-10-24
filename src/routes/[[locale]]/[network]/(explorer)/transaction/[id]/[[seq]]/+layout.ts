import { error } from '@sveltejs/kit';

import { truncateCenter } from '$lib/utils';
import { TransactionResponse } from '$lib/types/transaction';
import type { LayoutLoad } from './$types';
import { formatDateTime } from '$lib/utils/intl';

export const load: LayoutLoad = async ({ fetch, params, parent }) => {
	const { network } = await parent();
	const response = await fetch(`/en/${network}/api/transaction/${params.id}`);
	const json: TransactionResponse = await response.json();
	if (!json.id) {
		error(404, {
			message: `Transaction not found: ${truncateCenter(params.id || '', 14)}`,
			code: 'NOT_FOUND'
		});
	}
	const transaction = TransactionResponse.from(json);
	const lang = 'en';
	return {
		transaction,
		title: `${truncateCenter(String(json.id), 14)}`,
		subtitle: `Transaction on ${formatDateTime(transaction.block_time.toDate(), lang, {
			dateStyle: 'long',
			timeZone: 'UTC'
		})}`,
		header: {
			copyData: params.id
		},
		id: params.id,
		seq: params.seq,
		pageMetaTags: {
			title: `${String(transaction.id)} | ${network.chain.name} Network`,
			description: `A transaction performed at ${formatDateTime(
				transaction.block_time.toDate(),
				lang,
				{
					dateStyle: 'long',
					timeZone: 'UTC'
				}
			)} on the ${network.chain.name} Network.`
		}
	};
};
