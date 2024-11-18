import { AccountState } from '$lib/state/client/account.svelte';
import { Name } from '@wharfkit/antelope';
import type { LayoutLoad } from './$types';

// TODO: find the appropriate map for this
const chainNames = {
	eos: 'EOS'
};

export const load: LayoutLoad = async ({ fetch, params, parent }) => {
	const formattedNetworkName = chainNames[params.network as keyof typeof chainNames];

	// Always call awaited functions last to avoid delayed render
	const { network } = await parent();
	const account = AccountState.for(network, Name.from(String(params.name)), fetch);

	return {
		account,
		name: params.name,
		title: params.name,
		subtitle: `Account overview on the ${formattedNetworkName} Network`,
		pageMetaTags: {
			title: `${params.name} | ${formattedNetworkName} Network Account`,
			description: `An overview of the ${params.name} account on the ${formattedNetworkName} Network. View account assets, activity, resources and more.`
		}
	};
};
