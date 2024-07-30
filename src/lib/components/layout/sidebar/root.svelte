<!-- The Sidebar is used for two horizontally adjecent elements: one smaller and fixed width, the other filling the remaining space. In a narrow context the elements will stack vertically. -->

<script lang="ts">
	const { class: className = '', tag = 'div', children, ...props } = $props();
	// prop classes will override the default classes
	// remaining props will be passed to the root element
</script>

<svelte:element this={tag} class={`sidebar flex flex-wrap gap-4 ${className}`} {...props}>
	{@render children()}
</svelte:element>
