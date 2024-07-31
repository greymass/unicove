import { i18n } from '$lib/i18n';
import { type SeoConfig } from 'svead';
import { getNetwork } from '$lib/state/network.svelte.js';

export const load = async ({ fetch, url }) => {
	const modified = new URL(url);
	modified.pathname = i18n.route(url.pathname);
	const baseMetaTags: SeoConfig = {
		url: String(modified),
		title: '2nicove',
		description: 'Unicove, but 2.0'
	};

	const network = getNetwork(fetch);
	await network.refresh();

	return {
		baseMetaTags,
		network
	};
};
