import type { PageLoad } from './$types';

export const load: PageLoad = async () => {
	return {
		title: 'Fund Account',
		subtitle: 'Purchase EOS tokens to fund your account',
		pageMetaTags: {
			title: 'Fund Account',
			description: 'Purchase EOS tokens to fund your account'
		}
	};
};
