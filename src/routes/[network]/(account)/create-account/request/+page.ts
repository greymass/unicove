import type { PageLoad } from './$types';
// import * as m from '$lib/paraglide/messages';

export const load: PageLoad = async () => {
	return {
		title: 'Request Account Creation',
		subtitle: 'Request someone to create an account for you',
		pageMetaTags: {
			title: 'Request Account Creation',
			description: 'Request someone to create an account for you'
		}
	};
};
