<script lang="ts">
	import { getContext, onMount } from 'svelte';
	import { renderRichText, StoryblokComponent, useStoryblokBridge } from '@storyblok/svelte';

	import type { PageData } from './$types';
	import Code from '$lib/components/code.svelte';
	import type { UnicoveContext } from '$lib/state/client.svelte';

	const context = getContext<UnicoveContext>('state');

	let { data = $bindable() }: { data: PageData } = $props();
	let story = $state(data.story);

	onMount(() => {
		if (story) {
			useStoryblokBridge(data.story.id, (newStory) => (story = newStory), {
				preventClicks: true,
				resolveLinks: 'url'
			});
		}
	});

	let resolvedRichText = $derived(renderRichText(story.content.content));
</script>

{#if context.settings.data.debugMode}
	<Code json={story} />
{/if}

{#key story}
	{#if story && story.content}
		{#each story.content.body as blok}
			<StoryblokComponent {blok} />
		{/each}
		{@html resolvedRichText}
	{/if}
{/key}
