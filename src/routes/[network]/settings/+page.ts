import type { PageLoad } from './$types';
import * as m from '$lib/paraglide/messages';

export const load: PageLoad = () => {
	return {
		title: m.common_settings(),
		subtitle: m.settings_page_subtitle()
	};
};
