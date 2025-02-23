import type { PageLoad } from './$types';

export const load: PageLoad = async () => {
	return {
		title: 'Multi-Sig Account',
		subtitle: '',
		pageMetaTags: {
			title: 'Multi-Sig Account',
			description: ''
		}
	};
};
