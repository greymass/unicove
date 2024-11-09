import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async ({ parent }) => {
	const { network } = await parent();
	return {
		title: `${network.chain.name} Network Resources`,
		subtitle: `Manage CPU, NET, and RAM resources on the ${network.chain.name} Network.`,
		pageMetaTags: {
			title: `${network.chain.name} Network Resources`,
			description: `An overview of the resources available on the ${network.chain.name} network that provides access to manage resources using an compatible wallet.`
		}
	};
};
