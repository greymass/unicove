import { type SeoConfig } from 'svead';
import { i18n } from '$lib/i18n';

function generateMetadata(url: URL): SeoConfig {
	const modified = new URL(url);
	modified.pathname = i18n.route(url.pathname);
	return {
		url: String(modified),
		title: '2nicove',
		description: 'Unicove, but 2.0'
	};
}

export const load = async ({ url }) => {
	const baseMetaTags = generateMetadata(url);
	return {
		baseMetaTags
	};
};
