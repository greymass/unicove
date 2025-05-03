import * as m from '$lib/paraglide/messages';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ parent }) => {
	const { network } = await parent();
	return {
		title: m.common_swaps(),
		subtitle: m.common_swaps_available_network({
			network: network.chain.name
		}),
		pageMetaTags: {
			title: m.common_swaps(),
			description: m.common_swaps_available_network({
				network: network.chain.name
			})
		}
	};
};
