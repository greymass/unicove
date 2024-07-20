import { i18n } from '$lib/i18n';
import { type SeoConfig } from 'svead';

export const load = ({ url }) => {
	const modified = new URL(url);
	modified.pathname = i18n.route(url.pathname);
	const baseMetaTags: SeoConfig = {
		url: String(modified),
		title: '2nicove',
		description: 'Unicove, but 2.0'
	};

	return {
		baseMetaTags
	};
};
