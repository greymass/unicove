<script lang="ts">
	import { getContext } from 'svelte';
	import { storyblokEditable, StoryblokComponent } from '@storyblok/svelte';

	import type { UnicoveContext } from '$lib/state/client.svelte';
	import Code from '$lib/components/code.svelte';
	import type { LinkGridStoryblok } from './storyblok';

	const context = getContext<UnicoveContext>('state');

	let { blok }: { blok: LinkGridStoryblok } = $props();
</script>

{#if context.settings.data.debugMode}
	<Code json={blok} />
{/if}

{#key blok}
	{#if blok.grid}
		<div use:storyblokEditable={blok} class="px-6">
			{#each blok.grid as item}
				<StoryblokComponent blok={item} />
			{/each}
		</div>
	{/if}
{/key}
