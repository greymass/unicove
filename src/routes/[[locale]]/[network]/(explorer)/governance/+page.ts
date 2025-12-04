import { useLocale } from '$lib/utils/intl';
import type { PageLoad } from './$types';
import { SentimentState } from '../topics/state.svelte';

export const load: PageLoad = async ({ parent, fetch }) => {
	const { network, locale } = await parent();
	await useLocale(locale);

	// Load sentiment topics
	const sentimentState = new SentimentState(network, locale, fetch);
	try {
		await sentimentState.loadTopics();
	} catch (e) {
		console.error('Error loading topics:', e);
	}

	return {
		sentimentState,
		title: 'Governance',
		subtitle: `Participate in network governance on ${network.chain.name}`,
		pageMetaTags: {
			title: ['Governance', network.chain.name].join(' | '),
			description: `Vote on block producers and sentiment topics on the ${network.chain.name} network.`
		}
	};
};
