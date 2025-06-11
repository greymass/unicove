<script lang="ts">
	let props = $props();
</script>

<div class="col-span-full grid grid-cols-subgrid items-center gap-x-4 @2xl:grid-flow-col">
	{@render props.children()}
</div>
