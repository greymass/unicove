import type { PageLoad } from './$types';
import { TokenDefinition } from '$lib/types/token';

export const load: PageLoad = async ({ params, parent }) => {
	const { network } = await parent();
	const { basecontract, basesymbol, quotecontract, quotesymbol } = params;
	const base = TokenDefinition.from({
		contract: basecontract,
		symbol: basesymbol.toUpperCase(),
		chain: network.chain.id
	});
	const quote = TokenDefinition.from({
		contract: quotecontract,
		symbol: quotesymbol.toUpperCase(),
		chain: network.chain.id
	});
	return {
		base,
		quote,
		title: `Swap ${base.symbol.name}/${quote.symbol.name}`,
		subtitle: 'Description',
		pageMetaTags: {
			title: `Swap ${basesymbol}/${quotesymbol}`,
			description: 'Description'
		}
	};
};
