import { languageTag } from '$lib/paraglide/runtime';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params, parent }) => {
	const { network } = await parent();
	return {
		backPath: `/${languageTag()}/${params.network}/ram`,
		title: `Buy RAM`,
		subtitle: `Exchange ${network.chain.systemToken?.symbol.name} tokens for RAM on the ${network.chain.name} network.`,
		pageMetaTags: {
			title: `Buy RAM | ${network.chain.systemToken?.symbol.name}/RAM Market | ${network.chain.name} Network`,
			description: `Exchange ${network.chain.systemToken?.symbol.name} tokens for RAM on the ${network.chain.name} network using an ${network.chain.name} compatible wallet.`
		}
	};
};
