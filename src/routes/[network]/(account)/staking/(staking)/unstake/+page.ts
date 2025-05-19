import type { PageLoad } from './$types';
import * as m from '$lib/paraglide/messages';
import { getLocale } from '$lib/paraglide/runtime';

export const load: PageLoad = async ({ parent }) => {
	const { network } = await parent();
	return {
		title: m.common_unstake(),
		subtitle: m.common_unstake_tokens({
			token: String(network.chain.systemToken?.symbol.name)
		}),
		backPath: `/${getLocale()}/${network}/staking`,
		pageMetaTags: {
			title: m.common_unstake_tokens({
				token: String(network.chain.systemToken?.symbol.name)
			}),
			description: m.staking_metadata_unstake_description({
				network: String(network.chain.name),
				token: String(network.chain.systemToken?.symbol.name)
			})
		}
	};
};
