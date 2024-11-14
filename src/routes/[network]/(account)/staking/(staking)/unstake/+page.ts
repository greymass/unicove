import { languageTag } from '$lib/paraglide/runtime';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params, parent }) => {
	const { network } = await parent();
	return {
		title: `Unstake ${network.chain.name}`,
		subtitle: `Select the amount of ${network.chain.name} to unstake`,
		backPath: `/${languageTag()}/${params.network}/staking`,
		pageMetaTags: {
			title: `Unstake ${network.chain.name} Tokens`,
			description: `Unstake ${network.chain.name} tokens and begin claiming the balance of your rewards using an ${network.chain.name} compatible wallet.`
		}
	};
};
