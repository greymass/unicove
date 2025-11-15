import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async ({ parent }) => {
	const { network } = await parent();
	return {
		network,
		title: 'Tools',
		subtitle: `An index of all the tools provided by Unicove for the ${network.chain.name} network.`
	};
};
