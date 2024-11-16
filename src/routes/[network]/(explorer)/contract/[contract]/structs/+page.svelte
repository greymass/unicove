<script lang="ts">
	import Stack from '$lib/components/layout/stack.svelte';

	const { data } = $props();
</script>

<Stack>
	{#each data.abi.structs as struct}
		<a href="/{data.network}/contract/{data.contract}/structs/{struct.name}">
			{struct.name}
		</a>
	{/each}
</Stack>
