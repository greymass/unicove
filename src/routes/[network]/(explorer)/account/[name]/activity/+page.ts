import type { PageLoad } from './$types';
import * as m from '$lib/paraglide/messages';

export const load: PageLoad = async ({ params, parent, fetch, url }) => {
	const { network } = await parent();

	const account = params.name;
	const startIndex = url.searchParams.get('start') || 0;

	const response = await fetch(`/${network}/api/account/${account}/activity/${-startIndex}`);
	const json = await response.json();

	return {
		account,
		network,
		json,
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
