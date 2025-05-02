import { error } from '@sveltejs/kit';

import { truncateCenter } from '$lib/utils';
import { TransactionResponse } from '$lib/types/transaction';
import * as m from '$lib/paraglide/messages';
import type { LayoutLoad } from './$types';
import { languageTag } from '$lib/paraglide/runtime';
import { formatDateTime } from '$lib/utils/intl';

export const load: LayoutLoad = async ({ fetch, params, parent }) => {
	const { network } = await parent();
	const response = await fetch(`/${network}/api/transaction/${params.id}`);
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
	const lang = languageTag();
	return {
		transaction,
		title: `${truncateCenter(String(json.id), 14)}`,
		subtitle: m.transaction_page_subtitle({
			date: formatDateTime(transaction.block_time.toDate(), lang, {
				dateStyle: 'long',
				timeZone: 'UTC'
			})
		}),
		header: {
			copyData: params.id
		},
		id: params.id,
		seq: params.seq,
		pageMetaTags: {
			title: m.transaction_page_meta_title({
				id: String(transaction.id),
				network: network.chain.name
			}),
			description: m.transaction_page_meta_description({
				date: formatDateTime(transaction.block_time.toDate(), lang, {
					dateStyle: 'long',
					timeZone: 'UTC'
				}),
				network: network.chain.name
			})
		}
	};
};
