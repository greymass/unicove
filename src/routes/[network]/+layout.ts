import { browser } from '$app/environment';
import { getNetworkByName } from '$lib/state/network.svelte.js';
import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async ({ fetch, params }) => {
	const network = getNetworkByName(params.network, fetch);
	if (browser && !network.loaded) {
		await network.refresh();
	}
	return {
		network
	};
};
