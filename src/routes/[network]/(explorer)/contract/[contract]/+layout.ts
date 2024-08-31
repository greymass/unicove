import type { PageLoad } from './$types';
import * as m from '$lib/paraglide/messages.js';

export const load: PageLoad = async ({ fetch, params }: Pageload) => {
	const response = await fetch(`/${params.network}/api/contract/${params.contract}`);
	const json = await response.json();
	const abi = json.abi.abi;
	return {
		abi,
		contract: params.contract
	};
};
