<script lang='ts'>
let props = $props();
</script>

<svelte:element
	this={props.href ? 'a' : 'button'}
	class='bg-blue-400 py-2 px-8 rounded-lg hover:bg-blue-300 active:bg-blue-500 text-white font-bold transition-colors'
	{...props}
>
	<slot />
</svelte:element>
