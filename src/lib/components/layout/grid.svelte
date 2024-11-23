<!-- The Grid is like the Cluster but with all elements aligned to columns and rows -->

<script lang="ts">
	import { cn } from '$lib/utils/style';
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		children: Snippet;
		tag?: string;
		itemWidth?: string;
	}

	const { tag, children, itemWidth = '20ch', class: className, ...props }: Props = $props();
</script>

<svelte:element
	this={tag}
	class={cn(`layout-grid`, className)}
	{...props}
	style={`--grid-itemWidth:${itemWidth}`}
>
	{@render children()}
</svelte:element>
