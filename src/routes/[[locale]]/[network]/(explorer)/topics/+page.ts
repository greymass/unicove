import { useLocale } from '$lib/utils/intl';
import type { PageLoad } from './$types';
import { SentimentState } from './state.svelte';

export const load: PageLoad = async ({ parent, fetch }) => {
	const { network, locale } = await parent();
	await useLocale(locale);

	const sentiment = new SentimentState(network, locale, fetch);

	try {
		await sentiment.loadTopics();
	} catch (e) {
		console.error('Error loading topics:', e);
	}

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
