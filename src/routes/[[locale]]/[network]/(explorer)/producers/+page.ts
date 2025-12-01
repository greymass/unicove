import type { PageLoad } from './$types';

export const load: PageLoad = async ({ parent }) => {
	const { network } = await parent();

	return {
		title: 'Block Producers',
		subtitle: `Validators on the ${network.chain.name} network.`
	};
};
