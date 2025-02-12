import { error } from '@sveltejs/kit';
import { getNetworkFromParams } from '$lib/state/network.svelte';
import type { PageLoad } from './$types';
import * as m from '$lib/paraglide/messages';

export const load: PageLoad = async ({ params }) => {
	const network = getNetworkFromParams(params.network);

	if (!network.config.metamask) {
		throw error(404, m.metamask_network_unsupported());
	}

	return {
		title: m.metamask_page_title({
			name: network.config.metamask.name
		}),
		subtitle: m.metamask_page_subtitle({
			name: network.config.metamask.name,
			network: network.chain.name
		}),
		pageMetaTags: {
			title: m.metamask_page_title({
				name: network.config.metamask.name
			}),
			description: m.metamask_page_subtitle({
				name: network.config.metamask.name,
				network: network.chain.name
			})
		}
	};
};
