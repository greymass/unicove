import { truncateCenter } from '$lib/utils';
import { error, type Load } from '@sveltejs/kit';
import * as m from '$lib/paraglide/messages';

export const load: Load = async ({ fetch, params, parent }) => {
	const { network } = await parent();
	const response = await fetch(`/${params.network}/api/transaction/${params.id}`);
	const json = await response.json();
	if (!json?.transaction?.id) {
		error(404, {
			message: m.transaction_404({
				transaction: truncateCenter(params.id || '', 14)
			}),
			code: 'NOT_FOUND'
		});
	}
	return {
		...json,
		title: `${truncateCenter(json.transaction.id, 14)}`,
		subtitle: m.transaction_page_subtitle({
			date: String(json.transaction.block_time)
		}),
		id: params.id,
		seq: params.seq,
		pageMetaTags: {
			title: m.transaction_page_meta_title({
				id: String(json.transaction.id),
				network: network.chain.name
			}),
			description: m.transaction_page_meta_description({
				date: String(json.transaction.block_time),
				network: network.chain.name
			})
		}
	};
};
