import { languageTag } from '$lib/paraglide/runtime';
import type { PageLoad } from './$types';
import * as m from '$lib/paraglide/messages';

export const load: PageLoad = async ({ params, parent }) => {
	const { network } = await parent();
	return {
		backPath: `/${languageTag()}/${params.network}/ram`,
		title: m.common_unit_sell({ unit: 'RAM' }),
		subtitle: m.ram_page_sell_subtitle({
			token: network.chain.systemToken?.symbol.name || m.common_tokens(),
			network: network.chain.name
		}),
		pageMetaTags: {
			title: [
				m.common_unit_sell({ unit: 'RAM' }),
				m.ram_metadata_buy_title({
					token: network.chain.systemToken?.symbol.name || m.common_tokens(),
					network: network.chain.name
				})
			].join(' | '),
			description: m.ram_metadata_sell_description({
				token: network.chain.systemToken?.symbol.name || m.common_tokens(),
				network: network.chain.name
			})
		}
	};
};
