import type { PageLoad } from './$types';
import * as m from '$lib/paraglide/messages';

export const load: PageLoad = async () => {
	return {
		title: m.common_create_account_direct(),
		subtitle: m.common_create_account_direct_description(),
		pageMetaTags: {
			title: m.common_create_account_direct(),
			description: m.common_create_account_direct_description()
		}
	};
};
