<script lang="ts">
	import Contract from '$lib/components/elements/contract.svelte';

	const { data } = $props();
</script>

<h2 class="h2">Actions</h2>
<div class="flex flex-wrap gap-4">
	{#each data.abi.actions as action}
		<Contract name={data.contract} action={action.name}>
			{action.name}
		</Contract>
	{/each}
</div>

<h2 class="h2">Structs</h2>
<div class="flex flex-wrap gap-4">
	{#each data.abi.structs as struct}
		<Contract name={data.contract} struct={struct.name}>
			{struct.name}
		</Contract>
	{/each}
</div>

<h2 class="h2">Tables</h2>
<div class="flex flex-wrap gap-4">
	{#each data.abi.tables as table}
		<Contract name={data.contract} table={table.name}>
			{table.name}
		</Contract>
	{/each}
</div>
