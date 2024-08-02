<!-- The Sidebar is used for two horizontally adjecent elements: one smaller and fixed width, the other filling the remaining space. In a narrow context the elements will stack vertically. -->

<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		threshold?: string;
		tag?: string;
		class?: string;
		children: Snippet;
	}
	const {
		threshold = '50%',
		children,
		tag = 'div',
		class: className = '',
		...props
	}: Props = $props();
</script>

<!-- 
We use a style attribute because the prop value in the class doesn't work with a derived rune
and directly on the element is simpler than a style tag.
-->
<svelte:element
	this={tag}
	class={`sidebar-content grow-[999] basis-0`}
	style={`min-width: ${threshold}`}
	{...props}
>
	{@render children()}
</svelte:element>
