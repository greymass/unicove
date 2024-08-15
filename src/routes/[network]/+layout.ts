import { getNetworkFromParams } from '$lib/state/network.svelte.js';

export const load = async ({ fetch, params }) => {
	const network = getNetworkFromParams(params.network, fetch);
	if (!network.loaded) {
		await network.refresh();
	}
	return {
		network
	};
};
