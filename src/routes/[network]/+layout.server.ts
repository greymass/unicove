import { type SeoConfig } from 'svead';
import { i18n } from '$lib/i18n';
import * as m from '$lib/paraglide/messages';
import { ogImage } from '$lib/utils/opengraph';
import type { LayoutServerLoad } from './$types';

function generateMetadata(url: URL): SeoConfig {
	const modified = new URL(url);
	modified.pathname = i18n.route(url.pathname);

	return {
		url: String(modified),
		title: m.og_default_title(),
		description: m.og_default_description(),
		open_graph_image: ogImage(url)
	};
}

export const load: LayoutServerLoad = async ({ url }) => {
	const baseMetaTags = generateMetadata(url);

	return {
		baseMetaTags
	};
};
