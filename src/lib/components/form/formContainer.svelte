<script>
	let props = $props();
</script>

<article class="@container relative grid grid-cols-3 gap-12 *:col-span-full">
	{@render props.children()}
</article>
