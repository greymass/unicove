import type { API } from '@wharfkit/antelope';

import type { PageLoad } from './$types';
import * as m from '$lib/paraglide/messages';

export interface TreePermission {
	permission: API.v1.AccountPermission;
	children?: TreePermission[];
}

export const load: PageLoad = async ({ params, parent }) => {
	const { network } = await parent();
	return {
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
