import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async ({ parent }) => {
	const { network } = await parent();
	return {
		title: `${network.chain.systemToken?.symbol.name}/RAM Market`,
		subtitle: `An overview of the ${network.chain.systemToken?.symbol.name}/RAM market on the ${network.chain.name} network.`,
		pageMetaTags: {
			title: `${network.chain.systemToken?.symbol.name}/RAM Market on the ${network.chain.name} Network`,
			description: `An overview of RAM Market on the ${network.chain.name} network providing access to buy and sell RAM using an ${network.chain.name} compatible wallet.`
		}
	};
};
