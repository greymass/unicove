import { type SeoConfig } from 'svead';

export const load = ({ url }) => {
	const baseMetaTags: SeoConfig = {
		url: String(url),
		title: '2nicove',
		description: 'Unicove, but 2.0'
	};

	return {
		baseMetaTags
	};
};
