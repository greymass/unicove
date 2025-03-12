import { languageTag } from '$lib/paraglide/runtime';
import type { PageLoad } from './$types';
import * as m from '$lib/paraglide/messages';
import { PUBLIC_CHAIN_SHORT } from '$env/static/public';

export const load: PageLoad = () => {
	return {
		subtitle: m.resources_rent_with_rex_simple(),
		backPath: `/${languageTag()}/${PUBLIC_CHAIN_SHORT}/resources`
	};
};
