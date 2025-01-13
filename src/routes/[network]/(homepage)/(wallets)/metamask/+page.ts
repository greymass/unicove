import { error } from '@sveltejs/kit';
import { getNetworkFromParams } from '$lib/state/network.svelte';
import type { PageLoad } from './$types';
import * as m from '$lib/paraglide/messages';

export const load: PageLoad = async ({ params }) => {
	const network = getNetworkFromParams(params.network);

	if (!network.snapOrigin) {
		throw error(404, m.metamask_network_unsupported());
	}

	return {
		title: m.metamask_page_title({ network: network.chain.name }),
		subtitle: m.metamask_page_subtitle({ network: network.chain.name }),
		pageMetaTags: {
			title: m.metamask_page_title({ network: network.chain.name }),
			description: m.metamask_page_subtitle({ network: network.chain.name })
		}
	};
};
