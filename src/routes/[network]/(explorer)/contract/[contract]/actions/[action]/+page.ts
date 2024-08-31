import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params, parent }) => {
	const p = await parent();
	return {
		action: params.action,
		pageMetaTags: {
			title: `Action: ${params.action} | Contract: ${p.contract} | ${p.network.chain.name}`,
			description: `The ${params.action} action for the ${p.contract} smart contract on the ${p.network.chain.name} network.`
		}
	};
};
