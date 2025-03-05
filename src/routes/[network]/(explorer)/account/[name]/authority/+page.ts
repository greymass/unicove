import type { PageLoad } from './$types';
import * as m from '$lib/paraglide/messages';

export const load: PageLoad = async ({ params, parent }) => {
	const { network } = await parent();
	const authorizations = network.client.v1.chain.get_accounts_by_authorizers({
		accounts: [params.name]
	});
	return {
		authorizations,
		subtitle: 'Accounts allowing this account to sign on their behalf',
		pageMetaTags: {
			title: m.explorer_account_balances_meta_title({
				account: params.name,
				network: network.chain.name
			}),
			description: m.explorer_account_balances_meta_description({
				account: params.name,
				network: network.chain.name
			})
		}
	};
};
