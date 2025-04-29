<script lang="ts">
	import { getContext } from 'svelte';

	import type { UnicoveContext } from '$lib/state/client.svelte';
	import Code from '$lib/components/code.svelte';
	import Button from '$lib/components/button/button.svelte';
	import type { ButtonStoryblok } from './storyblok';

	const context = getContext<UnicoveContext>('state');

	let { blok }: { blok: ButtonStoryblok } = $props();
</script>

{#if context.settings.data.debugMode}
	<Code json={blok} />
{/if}

{#key blok}
	{#if blok.link}
		<Button href="/news/{blok.link.cached_url}">
			{blok.text}
		</Button>
	{:else}
		<Button disabled>
			{blok.text}
		</Button>
	{/if}
{/key}
