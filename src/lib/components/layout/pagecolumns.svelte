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

<div class={cn('gap-6 *:mb-6 *:inline-block *:w-full last:*:mb-0 @2xl:columns-2', props.class)}>
	{@render props.children()}
</div>
