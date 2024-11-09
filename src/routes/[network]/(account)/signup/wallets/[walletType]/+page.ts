import { languageTag } from '$lib/paraglide/runtime';
import type { PageLoad } from './$types';

export const load: PageLoad = ({ params }) => {
	return {
		subtitle: `Choose a ${params.walletType} wallet`,
		backPath: `/${languageTag()}/${params.network}/signup/wallets`
	};
};
