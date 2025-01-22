import { type SeoConfig } from 'svead';
import { i18n } from '$lib/i18n';
import type { LoadEvent } from '@sveltejs/kit';
import defaultImage from '$lib/assets/opengraph/default.png';

function generateMetadata(url: URL): SeoConfig {
	const modified = new URL(url);
	modified.pathname = i18n.route(url.pathname);
	return {
		url: String(modified),
		title: 'Unicove - Your gateway to the EOS Network',
		description: 'Stake, Send, Manage Tokens, and Explore EOS – all with ease',
		open_graph_image: defaultImage
	};
}

export const load = ({ params, url }: LoadEvent) => {
	const baseMetaTags = generateMetadata(url);
	return {
		baseMetaTags,
		network: params.network
	};
};
