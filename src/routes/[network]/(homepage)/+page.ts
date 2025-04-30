import { apiPlugin, storyblokInit, useStoryblokApi } from '@storyblok/svelte';
import type { PageLoad } from './$types';
import type { ResourceTypeStoryblok } from '$lib/storyblok/storyblok';
import type { Article } from '$lib/types/content';
import {
	PUBLIC_STORYBLOK_CONTENT_TYPE,
	PUBLIC_STORYBLOK_REGION,
	PUBLIC_STORYBLOK_SOURCE,
	PUBLIC_STORYBLOK_TOKEN
} from '$env/static/public';

async function getStoryblokStories(limit = 3): Promise<Article[]> {
	if (!PUBLIC_STORYBLOK_TOKEN || !PUBLIC_STORYBLOK_SOURCE) {
		return [];
	}
	try {
		storyblokInit({
			accessToken: PUBLIC_STORYBLOK_TOKEN,
			apiOptions: {
				region: PUBLIC_STORYBLOK_REGION
			},
			use: [apiPlugin]
		});
		const storyblok = await useStoryblokApi();
		const data = await storyblok.get(`cdn/stories`, {
			version: 'published',
			content_type: PUBLIC_STORYBLOK_CONTENT_TYPE,
			per_page: limit
		});
		return data.data.stories.map((story: ResourceTypeStoryblok) => ({
			title: story.content.title,
			date: story.content.date,
			thumbnail: story.content.seo[0].image.filename,
			description: story.content.seo[0].metaDescription,
			slug: `${PUBLIC_STORYBLOK_SOURCE}/${story.full_slug}`
		}));
	} catch (error) {
		console.error('Error fetching stories:', error);
		return [];
	}
}

export const load: PageLoad = async () => {
	const articles = await getStoryblokStories(3);
	return {
		articles
	};
};
