<!-- The Sidebar is used for two horizontally adjecent elements: one smaller and fixed width, the other filling the remaining space. In a narrow context the elements will stack vertically. -->

<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		class?: string;
		tag?: string;
		children: Snippet;
	}

	const { class: className = '', tag = 'div', children, ...props }: Props = $props();
</script>

<svelte:element this={tag} class={`sidebar flex flex-wrap gap-4 ${className}`} {...props}>
	{@render children()}
</svelte:element>
