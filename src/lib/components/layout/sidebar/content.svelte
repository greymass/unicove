<!-- The Sidebar is used for two horizontally adjecent elements: one smaller and fixed width, the other filling the remaining space. In a narrow context the elements will stack vertically. -->

<script lang='ts'>
	const {
		threshold = '50%',
		children,
		tag = 'div',
		class: className = '', 
		...props} = $props();
	// prop classes will override the default classes
	// remaining props will be passed to the root element
</script>


<svelte:element this={tag} class={`sidebar-content grow-[999] basis-0 min-w-[${threshold}]`} {...props}>
		{@render children()}
</svelte:element>
