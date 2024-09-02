import type { PageLoad } from './$types';
import * as m from '$lib/paraglide/messages.js';

export const load: PageLoad = async ({ parent }) => {
	const p = await parent();
	return {
		pageMetaTags: {
			title: [m.contract_actions_page_title(), p.pageMetaTags.title].join(' | '),
			description: m.contract_actions_page_description({
				actions: p.abi.actions.length,
				contract: p.contract,
				network: p.network.chain.name
			})
		}
	};
};
