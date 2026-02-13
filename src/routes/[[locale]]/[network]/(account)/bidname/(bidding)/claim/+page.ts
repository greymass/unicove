import type { PageLoad } from './$types';

export const load: PageLoad = async ({ parent }) => {
	const { network } = await parent();
	return {
		title: 'Claim Name',
		subtitle: 'Claim a won premium name',
		backPath: `/${network}/bidname`,
		pageMetaTags: {
			title: `Claim Name - ${String(network.chain.name)} Premium Names`,
			description: `Claim a won premium account name on the ${String(network.chain.name)} network.`
		}
	};
};
