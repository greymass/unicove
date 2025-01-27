import type { RequestEvent } from '@sveltejs/kit';
import { getNetworkFromParams } from '$lib/state/network.svelte.js';
import { type SeoConfig } from 'svead';
import { i18n } from '$lib/i18n';
import * as m from '$lib/paraglide/messages';
import { getOgImage } from '$lib/utils';

function generateMetadata(url: URL): SeoConfig {
	const modified = new URL(url);
	modified.pathname = i18n.route(url.pathname);

	return {
		url: String(modified),
		title: m.og_title_default(),
		description: m.og_description_default(),
		open_graph_image: getOgImage()
	};
}

export const load = async ({ fetch, params, url }: RequestEvent) => {
	const network = getNetworkFromParams(String(params.network), fetch);
	if (!network.loaded) {
		await network.refresh();
	}

	const baseMetaTags = generateMetadata(url);

	return {
		baseMetaTags,
		network
	};
};
