<script lang="ts">
	let props = $props();
</script>

<div class="table-row *:table-cell *:content-center">
	{@render props.children()}
</div>
