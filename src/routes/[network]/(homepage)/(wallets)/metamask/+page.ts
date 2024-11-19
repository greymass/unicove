import { error } from '@sveltejs/kit';
import { getNetworkFromParams } from '$lib/state/network.svelte';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params }) => {
	const network = getNetworkFromParams(params.network);

	if (!network.snapOrigin) {
		throw error(404, 'Network does not support MetaMask Snaps');
	}

	return {
		title: `MetaMask + ${network.chain.name} Wallet`,
		subtitle: `Get started with MetaMask on the ${network.chain.name} Network with the ${network.chain.name} Wallet snap.`,
		pageMetaTags: {
			title: `MetaMask + ${network.chain.name} Wallet`,
			description: `Get started with MetaMask on the ${network.chain.name} Network with the ${network.chain.name} Wallet snap.`
		}
	};
};
