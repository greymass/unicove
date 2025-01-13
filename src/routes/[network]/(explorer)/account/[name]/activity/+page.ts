import type { PageLoad } from './$types';
import * as m from '$lib/paraglide/messages';

export const load: PageLoad = async ({ params, parent }) => {
	const { network } = await parent();
	return {
		subtitle: m.explorer_account_activity_subtitle({
			network: network.chain.name
		}),
		pageMetaTags: {
			title: m.explorer_account_activity_meta_title({
				account: params.name,
				network: network.chain.name
			}),
			description: m.explorer_account_activity_meta_description({
				account: params.name,
				network: network.chain.name
			})
		}
	};
};
