import { truncateCenter } from '$lib/utils';
import type { Load } from '@sveltejs/kit';

export const load: Load = async ({ fetch, params, parent }) => {
	const { network } = await parent();
	const response = await fetch(`/${params.network}/api/transaction/${params.id}`);
	const json = await response.json();
	return {
		...json,
		title: `${truncateCenter(json.transaction.id, 14)}`,
		subtitle: `Transaction on ${String(json.transaction.block_time)}`,
		id: params.id,
		seq: params.seq,
		pageMetaTags: {
			title: `${json.transaction.id} | ${network.chain.name} Network`,
			description: `A transaction performed at ${json.transaction.block_time} on the ${network.chain.name} Network.`
		}
	};
};
