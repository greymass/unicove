import { languageTag } from '$lib/paraglide/runtime';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params, parent }) => {
	const { network } = await parent();
	return {
		title: `Stake ${network.chain.name}`,
		subtitle: `Select the amount of ${network.chain.name} to stake`,
		backPath: `/${languageTag()}/${params.network}/staking`,
		pageMetaTags: {
			title: `Stake ${network.chain.name} Tokens`,
			description: `Stake ${network.chain.name} tokens and earn rewards using an ${network.chain.name} compatible wallet.`
		}
	};
};
