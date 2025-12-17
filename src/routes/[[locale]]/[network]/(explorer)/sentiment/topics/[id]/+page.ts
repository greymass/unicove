import type { PageLoad } from './$types';
import { error } from '@sveltejs/kit';

export const load: PageLoad = async ({ parent, params }) => {
	const { network, locale, sentiment } = await parent();
	const topicId = params.id;

	if (!topicId) {
		throw error(404, 'Topic not found');
	}

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
		backPath: `/${locale}/${params.network}/sentiment/topics`,
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
