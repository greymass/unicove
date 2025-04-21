import { languageTag } from '$lib/paraglide/runtime';
import type { PageLoad } from './$types';
import * as m from '$lib/paraglide/messages';

export const load: PageLoad = async ({ parent }) => {
	const { network } = await parent();
	return {
		title: m.common_stake(),
		subtitle: m.common_stake_tokens({
			token: String(network.token.symbol.name)
		}),
		backPath: `/${languageTag()}/${network}/staking`,
		pageMetaTags: {
			title: m.common_stake_tokens({
				token: String(network.token.symbol.name)
			}),
			description: m.staking_metadata_stake_description({
				network: String(network.chain.name),
				token: String(network.token.symbol.name)
			})
		}
	};
};
