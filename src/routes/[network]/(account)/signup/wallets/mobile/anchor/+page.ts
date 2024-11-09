import { languageTag } from '$lib/paraglide/runtime';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params }) => {
	return {
		// title: 'Setup Anchor Mobile Wallet',
		// subtitle: 'Follow these steps to get started with Anchor on your mobile device'
		// backPath: `/${languageTag()}/${params.network}/signup/wallets`
	};
};
