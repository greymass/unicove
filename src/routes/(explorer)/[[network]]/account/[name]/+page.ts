import type { PageLoad } from './$types';
import * as m from '$lib/paraglide/messages.js';
import { AccountState } from '$lib/state/client/account.svelte';
import { getChainDefinitionFromParams } from '$lib/state/network.svelte';

export const load: PageLoad = async ({ fetch, params }) => {
	const account = new AccountState(fetch);
	const chain = getChainDefinitionFromParams(params.network);
	await account.load(chain, params.name);
	return {
		account,
		name: params.name
	};
};
