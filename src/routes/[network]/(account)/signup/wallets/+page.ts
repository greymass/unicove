import { PUBLIC_CHAIN_SHORT } from '$env/static/public';
import { getLocale } from '$lib/paraglide/runtime';
import type { PageLoad } from './$types';

export const load: PageLoad = async () => {
	return {
		subtitle: 'Choose a wallet type',
		backPath: `/${getLocale()}/${PUBLIC_CHAIN_SHORT}/signup`
	};
};
