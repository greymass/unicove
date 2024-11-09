import type { Load } from '@sveltejs/kit';

export const load: Load = async ({ fetch, params }) => {
	const response = await fetch(`/${params.network}/api/transaction/${params.id}`);
	const json = await response.json();
	return {
		...json,
		title: `Transaction ${json.transaction.id.substring(0, 7)}`,
		subtitle: json.transaction.block_time,
		id: params.id,
		seq: params.seq
	};
};
