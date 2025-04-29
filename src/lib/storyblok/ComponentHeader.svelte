<script lang="ts">
	import { getContext } from 'svelte';
	import { storyblokEditable, StoryblokComponent, renderRichText } from '@storyblok/svelte';

	import type { UnicoveContext } from '$lib/state/client.svelte';
	import Code from '$lib/components/code.svelte';
	import type { ComponentHeaderStoryblok } from './storyblok';

	const context = getContext<UnicoveContext>('state');

	let { blok }: { blok: ComponentHeaderStoryblok } = $props();
	let resolvedRichText = $derived(renderRichText(blok.content));
</script>

{#if context.settings.data.debugMode}
	<Code json={blok} />
{/if}

{#key blok}
	<div use:storyblokEditable={blok} class="px-6">
		<p>{blok.eyebrow}</p>
		<h2 class="h2">{blok.heading}</h2>
		<div class="prose">{@html resolvedRichText}</div>
		{#if blok.buttons}
			{#each blok.buttons as button}
				<StoryblokComponent blok={button} />
			{/each}
		{/if}
	</div>
{/key}
