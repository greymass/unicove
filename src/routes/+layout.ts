import { type SeoConfig } from 'svead';
import { i18n } from '$lib/i18n';
import type { LoadEvent } from '@sveltejs/kit';
import defaultImage from '$lib/assets/opengraph/default.png';
import enOgImage from '$lib/assets/opengraph/en/default.png';
import zhOgImage from '$lib/assets/opengraph/zh/default.png';
import koOgImage from '$lib/assets/opengraph/ko/default.png';
import { languageTag } from '$lib/paraglide/runtime';

function generateMetadata(url: URL): SeoConfig {
	const modified = new URL(url);
	modified.pathname = i18n.route(url.pathname);

	let open_graph_image: string;

	switch (languageTag()) {
		case 'en':
			open_graph_image = enOgImage;
			break;
		case 'zh':
			open_graph_image = zhOgImage;
			break;
		case 'ko':
			open_graph_image = koOgImage;
			break;
		default:
			open_graph_image = defaultImage;
	}

	return {
		url: String(modified),
		title: 'Unicove - Your gateway to the EOS Network',
		description: 'Stake, Send, Manage Tokens, and Explore EOS – all with ease',
		open_graph_image: open_graph_image
	};
}

export const load = ({ params, url }: LoadEvent) => {
	const baseMetaTags = generateMetadata(url);
	return {
		baseMetaTags,
		network: params.network
	};
};
