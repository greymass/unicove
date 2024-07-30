<!-- The Sidebar is used for two horizontally adjecent elements: one smaller and fixed width, the other filling the remaining space. In a narrow context the elements will stack vertically. -->

<script lang="ts">
	const { width, children, tag = 'div', class: className = '', ...props } = $props();
</script>

<svelte:element
	this={tag}
	class={`sidebar-side grow ${className}`}
	style={`flex-basis: ${width}`}
	{...props}
>
	{@render children()}
</svelte:element>
