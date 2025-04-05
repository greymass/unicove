import type { PageLoad } from './$types';
import { Token } from '$lib/types/token';

export const load: PageLoad = async ({ params, parent }) => {
	const { network } = await parent();
	const { basecontract, basesymbol, quotecontract, quotesymbol } = params;
	const base = Token.from({
		id: {
			contract: basecontract,
			symbol: basesymbol.toUpperCase(),
			chain: network.chain.id
		}
	});
	const quote = Token.from({
		id: {
			contract: quotecontract,
			symbol: quotesymbol.toUpperCase(),
			chain: network.chain.id
		}
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
