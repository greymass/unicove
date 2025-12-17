import { useLocale } from '$lib/utils/intl';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ parent }) => {
	const { network, locale, sentiment } = await parent();
	await useLocale(locale);

	return {
		sentiment,
		title: 'Network Sentiment',
		subtitle: 'Express your opinion on topics important to the community',
		pageMetaTags: {
			title: ['Network Sentiment', network.chain.name].join(' | '),
			description: 'Express your opinion on topics important to the community'
		}
	};
};
