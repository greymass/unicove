<script lang="ts">
	import { getContext } from 'svelte';
	import { storyblokEditable, StoryblokComponent } from '@storyblok/svelte';

	import type { UnicoveContext } from '$lib/state/client.svelte';
	import Code from '$lib/components/code.svelte';
	import type { IconLinkStoryblok } from './storyblok';

	const context = getContext<UnicoveContext>('state');

	let { blok }: { blok: IconLinkStoryblok } = $props();
</script>

{#if context.settings.data.debugMode}
	<Code json={blok} />
{/if}

{#key blok}
	{#if blok.link}
		<a href={blok.link.cached_url}>
			{#if blok.icon}
				<img src={blok.icon.filename} />
			{/if}
			{blok.text}
		</a>
	{/if}
	<div use:storyblokEditable={blok} class="px-6">
		{#each blok.grid as column}
			<StoryblokComponent blok={column} />
		{/each}
	</div>
{/key}
