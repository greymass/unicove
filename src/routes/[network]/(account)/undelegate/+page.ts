import type { PageLoad } from './$types';

export const load: PageLoad = async ({ parent }) => {
	const { network } = await parent();
	return {
		title: `Reclaim`,
		subtitle: `Undelegate and reclaim previously delegated ${network.chain.systemToken?.symbol.code} tokens`,
		pageMetaTags: {
			title: `Reclaim Delegated ${network.chain.name} Tokens`,
			description: `Undelegate and reclaim previously delegated ${network.chain.systemToken?.symbol.code} tokens.`
		}
	};
};
