import { languageTag } from '$lib/paraglide/runtime';
import type { PageLoad } from './$types';

export const load: PageLoad = ({ params }) => {
	return {
		subtitle: 'Renting',
		backPath: `/${languageTag()}/${params.network}/resources`
	};
};
