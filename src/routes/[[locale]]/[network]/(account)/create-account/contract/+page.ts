import type { PageLoad } from './$types';
import * as m from '$lib/paraglide/messages';

export const load: PageLoad = async () => {
	return {
		title: m.common_smart_contract_account_creation(),
		subtitle: m.common_smart_contract_account_creation_description(),
		pageMetaTags: {
			title: m.common_smart_contract_account_creation(),
			description: m.common_smart_contract_account_creation_description()
		}
	};
};
