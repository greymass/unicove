import type { PageLoad } from './$types';

export const load: PageLoad = async () => {
	return {
		title: `Token Directory`,
		subtitle: ``,
		pageMetaTags: {
			title: `Token Directory`,
			description: ``
		}
	};
};
