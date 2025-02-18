import { error } from '@sveltejs/kit';

import { truncateCenter } from '$lib/utils';
import { TransactionResponse } from '$lib/types/transaction';
import * as m from '$lib/paraglide/messages';
import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async ({ fetch, params, parent }) => {
	const { network } = await parent();
	const response = await fetch(`/${params.network}/api/transaction/${params.id}`);
	const json: TransactionResponse = await response.json();
	if (!json.id) {
		error(404, {
			message: m.transaction_404({
				transaction: truncateCenter(params.id || '', 14)
			}),
			code: 'NOT_FOUND'
		});
	}
	const transaction = TransactionResponse.from(json);
	return {
		transaction,
		title: `${truncateCenter(String(json.id), 14)}`,
		subtitle: m.transaction_page_subtitle({
			date: String(json.block_time)
		}),
		id: params.id,
		seq: params.seq,
		pageMetaTags: {
			title: m.transaction_page_meta_title({
				id: String(json.id),
				network: network.chain.name
			}),
			description: m.transaction_page_meta_description({
				date: String(json.block_time),
				network: network.chain.name
			})
		}
	};
};
