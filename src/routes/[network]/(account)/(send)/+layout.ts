import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async ({ parent }) => {
	const { network } = await parent();
	return {
		title: 'Send Tokens',
		subtitle: 'Transfer tokens to another account.',
		pageMetaTags: {
			title: 'Send Tokens',
			description: `Transfer tokens from one account to another account on the ${network.chain.name} network using an ${network.chain.name} compatible wallet.`
		}
	};
};
