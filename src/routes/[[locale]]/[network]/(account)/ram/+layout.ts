import type { LayoutLoad } from './$types';
import { ramtoken, systemtoken } from '$lib/wharf/chains';

export const load: LayoutLoad = async ({ parent }) => {
	const { network } = await parent();
	const token = String(network.chain.systemToken?.symbol.name || 'tokens');
	return {
		title: `${ramtoken.name}/${systemtoken.name}  Market`,
		subtitle: `An overview of the ${ramtoken.name}/${systemtoken.name} market on the ${network.chain.name} Network.`,
		pageMetaTags: {
			title: [`${ramtoken.name}/${systemtoken.name} Market | ${network.chain.name} Network`].join(
				' | '
			),
			description: `An overview of RAM Market on the ${network.chain.name} network that provides access to buy and sell RAM with ${token} using an ${network.chain.name} compatible wallet.`
		}
	};
};
