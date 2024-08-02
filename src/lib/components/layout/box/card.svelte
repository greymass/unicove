<!-- The Card is a Box with slots for content and additional styling -->
<script lang="ts">
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

<div class={`card ${className}`} {...props}>
	{#if title}
		<svelte:element this={titleTag} class="card-title h3">
			{title}
		</svelte:element>
	{/if}
	{@render children()}
</div>
