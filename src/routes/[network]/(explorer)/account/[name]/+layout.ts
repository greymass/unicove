import { AccountState } from '$lib/state/client/account.svelte';
import { getNetworkFromParams } from '$lib/state/network.svelte';
import type { LoadEvent } from '@sveltejs/kit';

export const load = async ({ fetch, params }: LoadEvent) => {
	const network = getNetworkFromParams(String(params.network));
	const account = await AccountState.for(network, String(params.name), fetch);
	return {
		account,
		name: params.name
	};
};
