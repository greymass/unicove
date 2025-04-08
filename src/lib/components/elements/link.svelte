<script lang="ts">
	import { cn } from '$lib/utils';
	import { type Snippet } from 'svelte';
	import type { HTMLAnchorAttributes } from 'svelte/elements';

	interface Props extends HTMLAnchorAttributes {
		href: string;
		children?: Snippet;
		text?: string;
	}

	let { href, text = '', children, ...props }: Props = $props();
</script>

<a
	{href}
	class={cn(
		'focus-visible:outline-solar-500 text-primary hover:text-primary-container inline-flex items-center gap-2 focus-visible:outline ',
		props.class
	)}
>
	{#if children}
		{@render children()}
	{:else}
		{text}
	{/if}
</a>
