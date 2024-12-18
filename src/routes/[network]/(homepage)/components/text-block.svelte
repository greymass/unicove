<script lang="ts">
	import Button from './homepage-button.svelte';
	import Stack from '$lib/components/layout/stack.svelte';
	import type { Snippet } from 'svelte';

	interface Props {
		title: string;
		text: string;
		children?: Snippet;
		button?: { text: string; href: string };
	}
	let props: Props = $props();
</script>

<Stack class="max-w-md items-start">
	<h3 class="h3 leading-tight">{props.title}</h3>
	<p>{props.text}</p>
	{#if props.button && props.button.href}
		<Button text={props.button.text} href={props.button.href} icon />
	{/if}
	{@render props.children?.()}
</Stack>
