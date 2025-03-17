<script>
	let props = $props();
</script>

<article class="relative grid grid-cols-3 gap-12 @container *:col-span-full">
	{@render props.children()}
</article>
