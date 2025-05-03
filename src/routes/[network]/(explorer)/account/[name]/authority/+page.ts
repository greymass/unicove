import type { PageLoad } from './$types';
import * as m from '$lib/paraglide/messages';

export const load: PageLoad = async ({ params, parent }) => {
	const { network } = await parent();
	const authorizations = network.client.v1.chain.get_accounts_by_authorizers({
		accounts: [params.name]
	});
	return {
		authorizations,
		subtitle: m.common_authorities_description({ account: params.name }),
		pageMetaTags: {
			description: m.common_authorities_description({ account: params.name })
		}
	};
};
