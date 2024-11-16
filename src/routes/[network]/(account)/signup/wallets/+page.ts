import { languageTag } from '$lib/paraglide/runtime';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params }) => {
	return {
		subtitle: 'Choose a wallet type',
		backPath: `/${languageTag()}/${params.network}/signup`
	};
};
