import { AccountState } from '$lib/state/client/account.svelte';
import { getNetworkFromParams } from '$lib/state/network.svelte';
import { error, type LoadEvent } from '@sveltejs/kit';

export const load = async ({ fetch, params }: LoadEvent) => {
	const network = getNetworkFromParams(String(params.network));
	let account: AccountState;
	try {
		account = await AccountState.for(network, String(params.name), fetch);
	} catch (e) {
		console.error(e);
		error(404, { message: `Account not found: ${String(params.name)}`, code: 'NOT_FOUND' });
	}
	return {
		account,
		name: params.name
	};
};
