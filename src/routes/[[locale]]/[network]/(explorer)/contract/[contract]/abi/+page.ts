import type { PageLoad } from './$types';
import * as m from '$lib/paraglide/messages.js';
import type { LoadEvent } from '@sveltejs/kit';

export const load: PageLoad = async ({ parent }: LoadEvent) => {
	const p = await parent();
	return {
		pageMetaTags: {
			title: m.contract_abi_page_title(),
			description: m.contract_abi_page_description({
				contract: String(p.contract),
				network: p.network.chain.name
			})
		}
	};
};
