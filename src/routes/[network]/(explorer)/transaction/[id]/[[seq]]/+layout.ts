import type { Load } from '@sveltejs/kit';

export const load: Load = async ({ fetch, params }) => {
	const response = await fetch(`/${params.network}/api/transaction/${params.id}`);
	const json = await response.json();
	return {
		...json,
		network: params.network,
		id: params.id,
		seq: params.seq
	};
};
