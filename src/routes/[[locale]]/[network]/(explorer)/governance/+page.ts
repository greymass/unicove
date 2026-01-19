import { useLocale } from '$lib/utils/intl';
import type { PageLoad } from './$types';
import { TopicSentimentState } from '../sentiment/topics/state.svelte';
import { MsigSentimentState } from '$lib/state/sentiment/msig.svelte';

export const load: PageLoad = async ({ parent }) => {
	const { network, locale } = await parent();
	await useLocale(locale);

	const sentimentState = new TopicSentimentState(network, locale);
	const msigSentimentState = new MsigSentimentState(network, locale);

	try {
		await Promise.all([sentimentState.loadTopics(), msigSentimentState.loadMsigs()]);
	} catch (e) {
		console.error('Error loading sentiment data:', e);
	}

	return {
		sentimentState,
		msigSentimentState,
		title: 'Governance',
		subtitle: `Participate in network governance on ${network.chain.name}`,
		pageMetaTags: {
			title: ['Governance', network.chain.name].join(' | '),
			description: `Vote on block producers and sentiment topics on the ${network.chain.name} network.`
		}
	};
};
