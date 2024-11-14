import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import { getNetworkFromParams } from '$lib/state/network.svelte';

export const load: PageLoad = async ({ params }) => {
	const network = getNetworkFromParams(params.network);
	console.log({ network });

	if (!network.snapOrigin) {
		throw error(404, 'Network does not support MetaMask Snaps');
	}

	return {
		title: 'MetaMask EOS Wallet',
		subtitle: 'Update EOS Wallet for MetaMask'
	};
};
