<script lang="ts">
	import Button from '$lib/components/button/button.svelte';
	import Stack from '$lib/components/layout/stack.svelte';
	import { cn } from '$lib/utils/style';
	import type { Snippet } from 'svelte';

	interface Props {
		title: string;
		text: string;
		children?: Snippet;
		button?: { text: string; href: string };
		class?: string;
	}
	let props: Props = $props();
</script>

<Stack class={cn('max-w-md items-start', props.class)}>
	<h2 class="h3 leading-tight">{props.title}</h2>
	<p>{props.text}</p>
	{#if props.button && props.button.href}
		<Button class="-ml-3" variant="tertiary" href={props.button.href}>
			{props.button.text}
		</Button>
	{/if}
	{@render props.children?.()}
</Stack>
