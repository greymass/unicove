import type { PageLoad } from './$types';
import * as m from '$lib/paraglide/messages.js';
import { AccountState } from '$lib/state/client/account.svelte';
import { getNetworkFromParams } from '$lib/state/network.svelte';

export const load: PageLoad = async ({ fetch, params }) => {
	const network = getNetworkFromParams(params.network);
	const account = await AccountState.for(network, params.name, fetch);
	return {
		account,
		name: params.name
	};
};
