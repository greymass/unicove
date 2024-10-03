import { type SeoConfig } from 'svead';
import { i18n } from '$lib/i18n';
import type { LoadEvent } from '@sveltejs/kit';

function generateMetadata(url: URL): SeoConfig {
	const modified = new URL(url);
	modified.pathname = i18n.route(url.pathname);
	return {
		url: String(modified),
		title: '2nicove',
		description: 'Unicove, but 2.0'
	};
}

export const load = async ({ url }: LoadEvent) => {
	const baseMetaTags = generateMetadata(url);
	return {
		baseMetaTags
	};
};
