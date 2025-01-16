import type { LayoutLoad } from './$types';
import * as m from '$lib/paraglide/messages';

export const load: LayoutLoad = async ({ parent }) => {
	const { network } = await parent();
	const title = m.resources_network_title({
		network: network.chain.name
	});
	return {
		title,
		subtitle: m.resources_network_subtitle({
			network: network.chain.name
		}),
		pageMetaTags: {
			title,
			description: m.resources_metadata_overview_description({
				network: network.chain.name
			})
		}
	};
};
