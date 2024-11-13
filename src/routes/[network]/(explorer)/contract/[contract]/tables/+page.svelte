<script lang="ts">
	import Stack from '$lib/components/layout/stack.svelte';

	const { data } = $props();
</script>

<Stack>
	{#each data.abi.tables as table}
		<a href="/{data.network}/contract/{data.contract}/tables/{table.name}">
			{table.name}
		</a>
	{/each}
</Stack>
