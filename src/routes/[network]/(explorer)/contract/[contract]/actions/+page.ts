import type { PageLoad } from './$types';
import * as m from '$lib/paraglide/messages.js';
import type { LoadEvent } from '@sveltejs/kit';

export const load: PageLoad = async ({ parent }: LoadEvent) => {
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
