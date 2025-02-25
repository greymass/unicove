import type { PageLoad } from './$types';
import * as m from '$lib/paraglide/messages';

export const load: PageLoad = async ({ params, parent }) => {
	const { network, account } = await parent();

	const permission = account.permissions.find((p) => p.perm_name.equals(params.permission));

	return {
		permission,
		permissionName: params.permission,
		subtitle: m.explorer_account_permissions_subtitle({
			network: network.chain.name
		}),
		pageMetaTags: {
			title: m.explorer_account_permissions_meta_title({
				account: params.name,
				network: network.chain.name
			}),
			description: m.explorer_account_permissions_meta_description({
				account: params.name,
				network: network.chain.name
			})
		}
	};
};
