<script lang="ts">
	import { cn } from '$lib/utils/style';
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		tag?: string;
		children?: Snippet;
		leftColumn?: Snippet;
		rightColumn?: Snippet;
		class?: string;
	}

	const props: Props = $props();
</script>

<!-- What we really need here is `grid-template-rows: masonry` which is still in draft spec -->
<!-- https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_grid_layout/Masonry_layout -->
<svelte:element
	this={props.tag || 'div'}
	class={cn('grid  items-start  gap-6 md:grid-cols-2', props.class)}
	data-masonry=""
>
	{#if props.children}
		<div class="col-span-full">
			{@render props.children()}
		</div>
	{/if}
	{#if props.leftColumn && props.rightColumn}
		<div class="left grid gap-6">
			{@render props.leftColumn()}
		</div>
		<div class="right grid gap-6">
			{@render props.rightColumn()}
		</div>
	{/if}
</svelte:element>
