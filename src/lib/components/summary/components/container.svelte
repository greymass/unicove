<script lang="ts">
	let props = $props();
</script>

<div class="flex flex-wrap items-center gap-x-4 gap-y-1">
	{@render props.children()}
</div>
