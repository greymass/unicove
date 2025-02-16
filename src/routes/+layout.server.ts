import { type SeoConfig } from 'svead';
import { i18n } from '$lib/i18n';
import * as m from '$lib/paraglide/messages';
import { ogImageUrl } from '$lib/utils/opengraph';
import type { LayoutServerLoad } from './$types';
import type { NetworkState } from '$lib/state/network.svelte';

function generateMetadata(url: URL, network: NetworkState): SeoConfig {
	const modified = new URL(url);
	modified.pathname = i18n.route(url.pathname);

	return {
		url: String(modified),
		title: m.og_default_title({
			network: network.chain.name
		}),
		description: m.og_default_description({
			network: network.chain.name
		}),
		open_graph_image: ogImageUrl(url)
	};
}

export const load: LayoutServerLoad = async ({ locals: { network }, url }) => {
	const baseMetaTags = generateMetadata(url, network);
	return {
		baseMetaTags
	};
};
