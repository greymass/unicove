import type { PageLoad } from './$types';
import * as m from '$lib/paraglide/messages';
import { ramtoken, systemtoken } from '$lib/wharf/chains';
import { getLocale } from '$lib/paraglide/runtime';

export const load: PageLoad = async ({ parent }) => {
	const { network } = await parent();
	return {
		backPath: `/${getLocale()}/${network}/ram`,
		title: m.common_unit_buy({ unit: 'RAM' }),
		subtitle: m.ram_page_subtitle({
			token: String(network.chain.systemToken?.symbol.name || m.common_tokens()),
			network: network.chain.name
		}),
		pageMetaTags: {
			title: [
				m.common_unit_buy({ unit: 'RAM' }),
				m.ram_metadata_buy_title({
					base: ramtoken.name,
					quote: systemtoken.name,
					network: network.chain.name
				})
			].join(' | '),
			description: m.ram_metadata_buy_description({
				base: ramtoken.name,
				quote: systemtoken.name,
				network: network.chain.name
			})
		}
	};
};
