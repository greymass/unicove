<!-- The Sidebar is used for two horizontally adjecent elements: one smaller and fixed width, the other filling the remaining space. In a narrow context the elements will stack vertically. -->

<script lang='ts'>
const {
	width,
	children,
	tag = 'div',
	class: className = '', 
	...props} = $props();
// prop classes will override the default classes
// remaining props will be passed to the root element

const classArray = ['sidebar-side grow'];
width && classArray.push(`basis-[${width}]`);
className && classArray.push(className);
const sidebarClasses = classArray.join(' ');
</script>


<svelte:element this={tag} class={sidebarClasses} {...props}>
	{@render children()}
</svelte:element>
