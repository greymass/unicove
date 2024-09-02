import type { PageLoad } from './$types';
import * as m from '$lib/paraglide/messages.js';

export const load: PageLoad = async ({ parent }) => {
	const p = await parent();
	return {
		pageMetaTags: {
			title: m.contract_abi_page_title(),
			description: m.contract_abi_page_description({
				contract: p.contract,
				network: p.network.chain.name
			})
		}
	};
};
