import { useLocale } from '$lib/utils/intl';
import type { PageLoad } from './$types';
import { error, redirect } from '@sveltejs/kit';
import { TopicSentimentState } from '../state.svelte';
import { fetchVpIndex } from '$lib/vp/fetch';
import { VP_BRANCH } from '$lib/vp/links';
import { vpForTopic } from '$lib/vp/onchain';

export const load: PageLoad = async ({ fetch, parent, params }) => {
	const { network, locale } = await parent();
	const topicId = params.id;

	await useLocale(locale);

	if (!topicId) {
		throw error(404, {
			message: 'Topic not found',
			code: 'NOT_FOUND',
			title: params.id,
			subtitle: 'Topic'
		});
	}

	const index = await fetchVpIndex(fetch, VP_BRANCH).catch(() => null);
	const bound = index ? vpForTopic(index, topicId) : null;
	if (bound) {
		redirect(307, `/${locale}/${params.network}/proposals/${bound.slug}/sentiment`);
	}

	const sentiment = new TopicSentimentState(network, locale);

	try {
		await Promise.all([sentiment.loadTopic(topicId), sentiment.loadTopicVotes(topicId)]);
	} catch (e) {
		console.error('Error loading topic:', e);
		throw error(500, 'Failed to load topic data');
	}

	if (!sentiment.currentTopic) {
		throw error(404, {
			message: 'Topic not found',
			code: 'NOT_FOUND',
			title: params.id,
			subtitle: 'Topic'
		});
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
