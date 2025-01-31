import { languageTag } from '$lib/paraglide/runtime';
import type { PageLoad } from './$types';
import * as m from '$lib/paraglide/messages';

export const load: PageLoad = ({ params }) => {
	return {
		subtitle: m.resources_rent_renting(),
		backPath: `/${languageTag()}/${params.network}/resources`
	};
};
