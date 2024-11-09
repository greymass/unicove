import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async ({ parent }) => {
	const { network } = await parent();
	return {
		title: `${network.chain.name} Network Staking`,
		subtitle: `An overview of staking on the ${network.chain.name} network.`,
		pageMetaTags: {
			title: `${network.chain.name} Network Staking`,
			description: `An overview of staking on the ${network.chain.name} network that provides easy access to stake, unstake, and withdraw ${network.chain.name} tokens using an ${network.chain.name} compatible wallet.`
		}
	};
};
