import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async ({ parent }) => {
	const { network } = await parent();
	return {
		title: `Get started on the ${network.chain.name} Network`,
		subtitle: `Select a wallet and create an account on the ${network.chain.name} network.`,
		pageMetaTags: {
			title: `Get started on the ${network.chain.name} Network`,
			description: `Select a ${network.chain.name} compatible wallet and create an account on the ${network.chain.name} network.`
		}
	};
};
