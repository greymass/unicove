import { getNetworkFromParams } from '$lib/state/network.svelte.js';
import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async ({ fetch, params, data }) => {
	const network = getNetworkFromParams(String(params.network), fetch);
	if (!network.loaded) {
		await network.refresh();
	}

	return {
		...data,
		network
	};
};
