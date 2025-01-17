import { languageTag } from '$lib/paraglide/runtime';
import type { PageLoad } from './$types';
import * as m from '$lib/paraglide/messages';

export const load: PageLoad = ({ params }) => {
	return {
		subtitle: m.resources_rent_with_rex_simple(),
		backPath: `/${languageTag()}/${params.network}/resources`
	};
};
