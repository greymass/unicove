import type { PageLoad } from './$types';

export const load: PageLoad = async () => {
	return {
		title: 'Create Account',
		subtitle: 'Create an account using your existing account',
		pageMetaTags: {
			title: 'Create Account',
			description: 'Create an account using your existing account'
		}
	};
};
