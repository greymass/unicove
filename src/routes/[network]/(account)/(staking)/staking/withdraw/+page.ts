import { languageTag } from '$lib/paraglide/runtime';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params, parent }) => {
	const { network } = await parent();
	return {
		title: `Withdraw ${network.chain.name}`,
		subtitle: `Select the amount of ${network.chain.name} to withdraw`,
		backPath: `/${languageTag()}/${params.network}/staking`,
		pageMetaTags: {
			title: `Withdraw ${network.chain.name} Tokens`,
			description: `Withdraw ${network.chain.name} tokens from the staking contract to add them to your available balance using an ${network.chain.name} compatible wallet.`
		}
	};
};
