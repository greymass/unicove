import { browser } from '$app/environment';
import { PUBLIC_CHAIN_SHORT } from '$env/static/public';
import { getNetworkByName } from '$lib/state/network.svelte.js';
import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async ({ fetch }) => {
	const network = getNetworkByName(PUBLIC_CHAIN_SHORT, fetch);
	if (browser && !network.loaded) {
		await network.refresh();
	}
	return {
		network
	};
};
