import type { PageLoad } from './$types';

export const load: PageLoad = async () => {
	return {
		title: 'Smart Contract Account Creation',
		subtitle: 'Create an account using a basic token transfer to a smart contract',
		pageMetaTags: {
			title: 'Smart Contract Account Creation',
			description: 'Create an account using a basic token transfer to a smart contract'
		}
	};
};
