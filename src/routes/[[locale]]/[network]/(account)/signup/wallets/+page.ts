import { PUBLIC_CHAIN_SHORT } from '$env/static/public';
import { languageTag } from '$lib/paraglide/runtime';
import type { PageLoad } from './$types';

export const load: PageLoad = async () => {
	return {
		subtitle: 'Choose a wallet type',
		backPath: `/${languageTag()}/${PUBLIC_CHAIN_SHORT}/signup`
	};
};
