import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params, parent }) => {
	const { network } = await parent();
	return {
		subtitle: `Multisig proposals by ${params.name} on the ${network.chain.name} Network.`,
		pageMetaTags: {
			description: `Multisig proposals by ${params.name} on the ${network.chain.name} Network.`
		}
	};
};
