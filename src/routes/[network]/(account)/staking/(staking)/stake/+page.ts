import type { PageLoad } from './$types';
import { getLocale } from '$lib/paraglide/runtime.js';
import * as m from '$lib/paraglide/messages';

export const load: PageLoad = async ({ parent }) => {
	const { network } = await parent();
	return {
		title: m.common_stake(),
		subtitle: m.common_stake_tokens({
			token: String(network.token.symbol.name)
		}),
		backPath: `/${getLocale()}/${network}/staking`,
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
