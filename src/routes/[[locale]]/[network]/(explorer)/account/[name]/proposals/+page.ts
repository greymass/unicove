import type { PageLoad } from './$types';
import * as m from '$lib/paraglide/messages';

export const load: PageLoad = async ({ params, parent }) => {
	const { network } = await parent();
	return {
		subtitle: m.common_msig_proposals_by({
			account: params.name,
			network: network.chain.name
		}),
		pageMetaTags: {
			description: m.common_msig_proposals_by({
				account: params.name,
				network: network.chain.name
			})
		}
	};
};
