import type { PageLoad } from './$types';
import { SentimentState } from '../../topics/state.svelte';
import { error } from '@sveltejs/kit';
import { useLocale } from '$lib/utils/intl';

export const load: PageLoad = async ({ parent, params, fetch }) => {
	const { network } = await parent();
	const locale = params.locale || 'en';
	const topicId = params.id;

	await useLocale(locale);

	if (!topicId) {
		throw error(404, 'Topic not found');
	}

	const sentiment = new SentimentState(network, locale, fetch);

	try {
		await Promise.all([sentiment.loadTopic(topicId), sentiment.loadTopicVotes(topicId)]);
	} catch (e) {
		console.error('Error loading topic:', e);
		throw error(500, 'Failed to load topic data');
	}

	if (!sentiment.currentTopic) {
		throw error(404, 'Topic not found');
	}

	return {
		sentiment,
		topicId,
		backPath: `/${locale}/${params.network}/topics`,
		title: sentiment.currentTopic.topic.id,
		subtitle: `Last updated ${new Date(sentiment.currentTopic.topic.lastUpdated).toLocaleString()}`,
		pageMetaTags: {
			title: [sentiment.currentTopic.topic.id, 'Sentiment', network.chain.name].join(' | '),
			description: [
				'Overview and statistics for community sentiment on the',
				sentiment.currentTopic.topic.id,
				'topic'
			].join(' ')
		}
	};
};
