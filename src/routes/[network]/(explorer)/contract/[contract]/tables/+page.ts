import type { PageLoad } from './$types';

export const load: PageLoad = async ({ parent }) => {
	const p = await parent();
	return {
		pageMetaTags: {
			title: `All Tables | Contract: ${p.contract} | ${p.network.chain.name}`,
			description: `A list of the data tables in the ${p.contract} contract on the ${p.network.chain.name} network.`
		}
	};
};
