<script lang="ts">
	import { cn } from '$lib/utils/style';
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		children: Snippet;
		class?: string;
	}

	const props: Props = $props();
</script>

<!-- What we really need here is `grid-template-rows: masonry` which is still in draft spec -->
<!-- https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_grid_layout/Masonry_layout -->
<div
	class={cn('gap-6 *:mb-6 *:w-full *:break-inside-avoid last:*:mb-0 @2xl:columns-2', props.class)}
>
	{@render props.children()}
</div>
