<script lang="ts">
	import Stack from '$lib/components/layout/stack.svelte';

	const { data } = $props();
</script>

<Stack>
	{#each data.abi.actions as action}
		<a href="/{data.network}/contract/{data.contract}/actions/{action.name}">
			{action.name}
		</a>
	{/each}
</Stack>
