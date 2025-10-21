import { PUBLIC_CHAIN_SHORT } from '$env/static/public';
import type { PageLoad } from './$types';

export const load: PageLoad = async () => {
	return {
		subtitle: 'Choose a wallet type',
		backPath: `/${PUBLIC_CHAIN_SHORT}/signup`
	};
};
