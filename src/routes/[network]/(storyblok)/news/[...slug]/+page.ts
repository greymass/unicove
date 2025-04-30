import type { PageLoad } from './$types';

export const load: PageLoad = async ({ parent, params }) => {
	const { storyblok } = await parent();
	const slug = params.slug && params.slug !== '' ? params.slug : 'home';

	const data = await storyblok.get(`cdn/stories/${slug}`, {
		version: 'published'
	});

	return {
		story: data.data.story
	};
};
