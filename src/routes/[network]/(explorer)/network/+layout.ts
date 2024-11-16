import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async ({ parent }) => {
	const { network } = await parent();
	return {
		title: network.chain.name,
		subtitle: 'Network Overview'
	};
};
