import { apiPlugin, storyblokInit, useStoryblokApi } from '@storyblok/svelte';
import type { LayoutLoad } from '../$types';

import LinkGrid from '$lib/storyblok/LinkGrid.svelte';
import PostCallout from '$lib/storyblok/PostCallout.svelte';
import IconLink from '$lib/storyblok/IconLink.svelte';
import ComponentHeader from '$lib/storyblok/ComponentHeader.svelte';
import Button from '$lib/storyblok/Button.svelte';

export const load: LayoutLoad = async () => {
	storyblokInit({
		accessToken: 'thjjVzeVltZMJUO7TR8Uawtt',
		apiOptions: {
			region: 'us'
		},
		components: {
			button: Button,
			linkGrid: LinkGrid,
			postCallout: PostCallout,
			iconLink: IconLink,
			componentHeader: ComponentHeader
		},
		use: [apiPlugin]
	});
	const storyblok = await useStoryblokApi();
	return {
		storyblok
	};
};
