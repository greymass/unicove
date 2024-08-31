import type { PageLoad } from './$types';

export const load: PageLoad = async ({ parent }) => {
	const p = await parent();
	return {
		pageMetaTags: {
			title: `All Structs | Contract: ${p.contract} | ${p.network.chain.name}`,
			description: `A list of the data structures defined by the ${p.contract} contract on the ${p.network.chain.name} network.`
		}
	};
};
