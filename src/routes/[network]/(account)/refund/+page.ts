import type { PageLoad } from './$types';

export const load: PageLoad = async ({ parent }) => {
	const { network } = await parent();
	return {
		title: `Refund`,
		subtitle: `Claim previously delegated ${network.chain.systemToken?.symbol.code} tokens`,
		pageMetaTags: {
			title: `Refund Delegated ${network.chain.name} Tokens`,
			description: `Claim previously delegated ${network.chain.name} tokens.`
		}
	};
};
