<!-- The Sidebar is used for two horizontally adjecent elements: one smaller and fixed width, the other filling the remaining space. In a narrow context the elements will stack vertically. -->

<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		width: string;
		tag?: string;
		class?: string;
		children: Snippet;
	}

	const { width, children, tag = 'div', class: className = '', ...props }: Props = $props();
</script>

<svelte:element
	this={tag}
	class={`sidebar-side grow ${className}`}
	style={`flex-basis: ${width}`}
	{...props}
>
	{@render children()}
</svelte:element>
