import type { RequestEvent } from '@sveltejs/kit';
import { getNetworkFromParams } from '$lib/state/network.svelte.js';

export const load = async ({ fetch, params }: RequestEvent) => {
	const network = getNetworkFromParams(String(params.network), fetch);
	if (!network.loaded) {
		await network.refresh();
	}
	return {
		network
	};
};
