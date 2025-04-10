import type { PageLoad } from './$types';
import { TokenDefinition } from '$lib/types/token';
import * as m from '$lib/paraglide/messages';

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
		title: m.swap_base_quote({
			base: base.name,
			quote: quote.name
		}),
		subtitle: m.swap_base_quote_description({
			base: base.name,
			quote: quote.name
		}),
		pageMetaTags: {
			title: m.swap_base_quote({
				base: base.name,
				quote: quote.name
			}),
			description: m.swap_base_quote_description({
				base: base.name,
				quote: quote.name
			})
		}
	};
};
