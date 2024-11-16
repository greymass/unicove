<!-- The Card is a Box with slots for content and additional styling -->
<script lang="ts">
	import { cn } from '$lib/utils/style';
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		title?: string;
		titleTag?: string;
		children: Snippet;
	}

	const {
		class: className = '',
		title = '',
		titleTag = 'h3',
		children,
		...props
	}: Props = $props();
</script>

<div class={cn('card', className)} {...props}>
	{#if title}
		<svelte:element this={titleTag} class="card-title h4">
			{title}
		</svelte:element>
	{/if}
	{@render children()}
</div>
