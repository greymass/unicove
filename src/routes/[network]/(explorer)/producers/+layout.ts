import type { LayoutLoad } from './$types';
import * as m from '$lib/paraglide/messages';

export const load: LayoutLoad = async ({ parent }) => {
	const { network } = await parent();
	return {
		title: m.common_block_producers(),
		subtitle: m.common_block_producers_description({
			network: network.chain.name
		})
	};
};
