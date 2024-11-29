import type { LayoutLoad } from './$types';
import * as m from '$lib/paraglide/messages';

export const load: LayoutLoad = async ({ parent }) => {
	const { network } = await parent();
	return {
		title: `${network.chain.systemToken?.symbol.name}/RAM Market`,
		subtitle: `An overview of the ${network.chain.systemToken?.symbol.name}/RAM market on the ${network.chain.name} network.`,
		pageMetaTags: {
			title: [
				m.ram_metadata_buy_title({
					token: network.chain.systemToken?.symbol.name || 'tokens',
					network: network.chain.name
				})
			].join(' | '),
			description: m.ram_metadata_overview_description({
				token: network.chain.systemToken?.symbol.name || 'tokens',
				network: network.chain.name
			})
		}
	};
};
