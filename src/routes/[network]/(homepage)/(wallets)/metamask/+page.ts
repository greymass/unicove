import { error } from '@sveltejs/kit';
import { getNetworkFromParams } from '$lib/state/network.svelte';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params }) => {
	const network = getNetworkFromParams(params.network);

	if (!network.snapOrigin) {
		throw error(404, 'Network does not support MetaMask Snaps');
	}

	return {
		title: 'MetaMask + EOS Wallet',
		subtitle:
			'Get started with the EOS Wallet plugin that makes MetaMask compatible with the EOS Network.'
	};
};
