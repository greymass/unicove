import type { PageLoad } from './$types';
import { TokenDefinition } from '$lib/types/token';

export const load: PageLoad = async ({ params, parent }) => {
	const { network } = await parent();
	const { basecontract, basesymbol, quotecontract, quotesymbol } = params;
	const base = network.getToken(
		TokenDefinition.from({
			contract: basecontract,
			symbol: basesymbol.toUpperCase(),
			chain: network.chain.id
		})
	);
	const quote = network.getToken(
		TokenDefinition.from({
			contract: quotecontract,
			symbol: quotesymbol.toUpperCase(),
			chain: network.chain.id
		})
	);
	return {
		base,
		quote,
		title: `Swap ${base.name}/${quote.name}`,
		subtitle: `Swap the ${base.name} token for the ${quote.name} token.`,
		pageMetaTags: {
			title: `Swap ${base.name}/${quote.name}`,
			description: `Swap the ${base.name} token for the ${quote.name} token.`
		}
	};
};
