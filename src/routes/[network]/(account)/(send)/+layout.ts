import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async ({ parent }) => {
	const { network } = await parent();
	return {
		title: 'Send',
		subtitle: 'Send Tokens',
		pageMetaTags: {
			title: 'Send Tokens',
			description: `Send tokens from one account to another account on the ${network.chain.name} network using an ${network.chain.name} compatible wallet.`
		}
	};
};
