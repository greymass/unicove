import type { PageLoad } from './$types';
import * as m from '$lib/paraglide/messages';

export const load: PageLoad = async () => {
	return {
		title: m.fund_account(),
		subtitle: m.fund_account_description(),
		pageMetaTags: {
			title: m.fund_account(),
			description: m.fund_account_seo_description()
		}
	};
};
