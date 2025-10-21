import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async ({ parent }) => {
	const { network } = await parent();
	return {
		title: 'Block Producers',
		subtitle: `Validators on the ${network.chain.name} network.`
	};
};
