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
		'inline-flex items-center gap-2 text-sky-blue-500 hover:text-sky-blue-400 focus-visible:outline focus-visible:outline-solar-500 ',
		props.class
	)}
>
	{#if children}
		{@render children()}
	{:else}
		{text}
	{/if}
</a>
