import type { PageLoad } from './$types';
import * as m from '$lib/paraglide/messages';

export const load: PageLoad = async ({ parent }) => {
	const { network } = await parent();
	return {
		title: 'Create Account',
		subtitle: 'Create an account using a token transfer',
		pageMetaTags: {
			title: 'Create Account',
			description: 'Create an account using a token transfer'
		}
	};
};
