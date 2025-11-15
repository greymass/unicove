import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params, parent }) => {
	const { network } = await parent();
	return {
		subtitle: `Recent activity on the ${network.chain.name} Network.`,
		pageMetaTags: {
			title: `Account Activity for ${params.name} | ${network.chain.name} Network`,
			description: `View the transaction history of the ${params.name} account on the ${network.chain.name} network.`
		}
	};
};
