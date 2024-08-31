import type { PageLoad } from './$types';

export const load: PageLoad = async ({ parent }) => {
	const p = await parent();
	return {
		pageMetaTags: {
			title: `ABI | Contract: ${p.contract} | ${p.network.chain.name}`,
			description: `The ABI defining the ${p.contract} smart contract on the ${p.network.chain.name} network.`
		}
	};
};
