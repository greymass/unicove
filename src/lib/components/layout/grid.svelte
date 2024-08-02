<!-- The Grid is like the Cluster but with all elements aligned to columns and rows -->

<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		children: Snippet;
		itemWidth?: string;
	}

	const { class: className = '', children, itemWidth = '20ch', ...props }: Props = $props();
</script>

<div class={`layout-grid`} {...props} style={`--grid-itemWidth:${itemWidth}`}>
	{@render children()}
</div>
