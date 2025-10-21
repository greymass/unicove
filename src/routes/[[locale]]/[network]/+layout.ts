import { browser } from '$app/environment';
import { PUBLIC_CHAIN_SHORT } from '$env/static/public';
import { getNetworkByName } from '$lib/state/network.svelte.js';
import { locales } from 'virtual:wuchale/locales';
import type { LayoutLoad } from './$types';
import { loadLocale } from 'wuchale/load-utils';

export const load: LayoutLoad = async ({ fetch, params }) => {
	const network = getNetworkByName(PUBLIC_CHAIN_SHORT, fetch);
	if (browser && !network.loaded) {
		await network.refresh();
	}
	if (browser && params.locale && locales.includes(params.locale)) {
		await loadLocale(params.locale);
	}
	return {
		locale: params.locale,
		network
	};
};
