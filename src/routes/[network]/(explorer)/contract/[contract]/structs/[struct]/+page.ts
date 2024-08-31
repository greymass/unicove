import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params, parent }) => {
	const p = await parent();
	return {
		pageMetaTags: {
			title: `Struct: ${params.struct} | Contract: ${p.contract} | ${p.network.chain.name}`,
			description: `The ${params.struct} data structure as defined by the ${p.contract} smart contract on the ${p.network.chain.name} network.`
		},
		struct: params.struct
	};
};
