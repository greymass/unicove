import type { LayoutLoad } from './$types';
import * as m from '$lib/paraglide/messages';
import { ramtoken, systemtoken } from '$lib/wharf/chains';

export const load: LayoutLoad = async ({ parent }) => {
	const { network } = await parent();
	const token = String(network.chain.systemToken?.symbol.name || m.common_tokens());
	return {
		title: m.ram_overview_titlle({ base: ramtoken.name, quote: systemtoken.name }),
		subtitle: m.ram_overview_subtitlle({
			base: ramtoken.name,
			quote: systemtoken.name,
			network: network.chain.name
		}),
		pageMetaTags: {
			title: [
				m.ram_metadata_buy_title({
					base: ramtoken.name,
					quote: systemtoken.name,
					network: network.chain.name
				})
			].join(' | '),
			description: m.ram_metadata_overview_description({
				token: token,
				network: network.chain.name
			})
		}
	};
};
