<script lang="ts">
	let props = $props();
</script>

<div class="overflow-x-auto">
	<div class="table w-fit border-spacing-4">
		{@render props.children()}
	</div>
</div>
