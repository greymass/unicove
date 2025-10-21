import { Name } from '@wharfkit/antelope';
import type { PageLoad } from './$types';
import * as m from '$lib/paraglide/messages';

export const load: PageLoad = async ({ params, parent, url }) => {
	const { network, account } = await parent();

	const permission = account.permissions.find((p) => p.perm_name.equals(params.permission));

	const backPath = new URL(url).pathname.split('/').slice(0, -1).join('/');

	return {
		permission,
		permissionName: Name.from(params.permission),
		backPath,
		title: params.permission,
		subtitle: m.common_edit_permission_for_account({
			account: params.name,
			network: network.chain.name
		}),
		pageMetaTags: {
			title: m.explorer_account_permissions_meta_title({
				account: params.name,
				network: network.chain.name
			}),
			description: m.common_edit_permission_for_account({
				account: params.name,
				network: network.chain.name
			})
		}
	};
};
