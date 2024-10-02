import { AccountState } from '$lib/state/client/account.svelte';
import { getNetworkFromParams } from '$lib/state/network.svelte';

export const load = async ({ fetch, params }) => {
	const network = getNetworkFromParams(params.network);
	const account = await AccountState.for(network, params.name, fetch);
	return {
		account,
		name: params.name
	};
};
