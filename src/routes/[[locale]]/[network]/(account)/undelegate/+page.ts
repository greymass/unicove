import type { PageLoad } from './$types';
import * as m from '$lib/paraglide/messages';

export const load: PageLoad = async ({ parent }) => {
	const { network } = await parent();
	return {
		title: m.common_reclaim(),
		subtitle: m.common_reclaim_delegated_tokens_description({
			token: network.token.name
		}),
		pageMetaTags: {
			title: m.common_reclaim_delegated_tokens({
				token: network.token.name
			}),
			description: m.common_reclaim_delegated_tokens_description({
				token: network.token.name
			})
		}
	};
};
