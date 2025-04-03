import type { LayoutLoad } from './$types';
import * as m from '$lib/paraglide/messages';
import { ogImageUrl } from '$lib/utils/opengraph';
import { Token } from '$lib/types/token';
import { Asset, Name } from '@wharfkit/antelope';

export const load: LayoutLoad = async ({ url, params, parent }) => {
	const { network } = await parent();
	let contract: Name | undefined;
	let symbol: Asset.Symbol | undefined;
	if (params.contract) {
		contract = Name.from(params.contract);
	}
	if (params.symbol) {
		symbol = Asset.Symbol.from(params.symbol);
	}
	let token: Token | undefined;
	if (contract && symbol) {
		token = Token.from({
			id: {
				symbol,
				contract,
				chain: network.chain.id
			}
		});
	} else {
		// Default to the system contract
		contract = network.token.contract;
		symbol = network.token.symbol;
		token = network.token;
	}
	return {
		contract,
		symbol,
		token,
		title: m.common_send_tokens({ token: symbol.name }),
		subtitle: m.common_transfer_to_another_account(),
		pageMetaTags: {
			title: m.common_send_tokens({ token: symbol.name }),
			description: m.send_page_description({
				network: network.chain.name
			}),
			open_graph_image: ogImageUrl(url)
		}
	};
};
