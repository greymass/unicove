import type { PageLoad } from './$types';
import * as m from '$lib/paraglide/messages';
import { PUBLIC_CHAIN_SHORT } from '$env/static/public';
import { getLocale } from '$lib/paraglide/runtime';

export const load: PageLoad = () => {
	return {
		subtitle: m.resources_rent_with_rex_simple(),
		backPath: `/${getLocale()}/${PUBLIC_CHAIN_SHORT}/resources`
	};
};
