import type { PageLoad } from './$types';
import * as m from '$lib/paraglide/messages.js';

export const load: PageLoad = async ({ parent }) => {
	const p = await parent();
	return {
		pageMetaTags: {
			title: [m.contract_tables_page_title(), p.pageMetaTags.title].join(' | '),
			description: m.contract_tables_page_description({
				tables: p.abi.tables.length,
				contract: p.contract,
				network: p.network.chain.name
			})
		}
	};
};
