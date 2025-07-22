import type { LayoutLoad } from './$types';
import * as m from '$lib/paraglide/messages';

export const load: LayoutLoad = async ({ parent }) => {
	const { network } = await parent();
	return {
		network,
		title: m.common_tools(),
		subtitle: m.common_tools_description({
			network: network.chain.name
		})
	};
};
