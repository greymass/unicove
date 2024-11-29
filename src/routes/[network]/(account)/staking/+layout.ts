import type { LayoutLoad } from './$types';
import * as m from '$lib/paraglide/messages';

export const load: LayoutLoad = async ({ parent }) => {
	const { network } = await parent();
	return {
		title: m.staking_network_title({
			network: network.chain.name
		}),
		subtitle: m.staking_network_subtitle({
			token: network.chain.systemToken?.symbol.name || m.common_tokens()
		}),
		pageMetaTags: {
			title: m.staking_network_title({
				network: network.chain.name
			}),
			description: m.staking_metadata_overview_description({
				network: network.chain.name,
				token: network.chain.systemToken?.symbol.name || m.common_tokens()
			})
		}
	};
};
