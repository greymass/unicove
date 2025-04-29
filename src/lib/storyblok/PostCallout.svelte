<script lang="ts">
	import { getContext } from 'svelte';
	import { storyblokEditable, StoryblokComponent } from '@storyblok/svelte';

	import type { UnicoveContext } from '$lib/state/client.svelte';
	import Code from '$lib/components/code.svelte';
	import type { PostCalloutStoryblok } from './storyblok';

	const context = getContext<UnicoveContext>('state');

	let { blok }: { blok: PostCalloutStoryblok } = $props();
</script>

{#if context.settings.data.debugMode}
	<Code json={blok} />
{/if}

{#key blok}
	{#if blok.componentHeader}
		<div use:storyblokEditable={blok} class="px-6">
			{#each blok.componentHeader as componentHeader}
				<StoryblokComponent blok={componentHeader} />
			{/each}
		</div>
	{/if}
{/key}
