import { type SeoConfig } from 'svead';
import { i18n } from '$lib/i18n';
import * as m from '$lib/paraglide/messages';
import { ogImageURL } from '$lib/utils/opengraph';
import type { LayoutServerLoad } from './$types';
import type { NetworkState } from '$lib/state/network.svelte';
import { error } from '@sveltejs/kit';
import { API_OPENGRAPH_GENERATOR, API_OPENGRAPH_TOKEN } from '$env/static/private';

function generateMetadata(url: URL, network: NetworkState): SeoConfig {
	const modified = new URL(url);
	modified.pathname = i18n.route(url.pathname);

	let open_graph_image = undefined;
	if (API_OPENGRAPH_GENERATOR && API_OPENGRAPH_TOKEN) {
		open_graph_image = ogImageURL(url, {
			title: 'Unicove',
			text: 'Your gateway to Web3'
		});
	}

	return {
		url: String(modified),
		title: m.og_default_title({
			network: network.chain.name
		}),
		description: m.og_default_description({
			network: network.chain.name
		}),
		open_graph_image
	};
}

export const load: LayoutServerLoad = async ({ locals: { network }, url }) => {
	if (!network) {
		error(404, {
			message: 'Page not found'
		});
	}
	const baseMetaTags = generateMetadata(url, network);
	return {
		baseMetaTags
	};
};
