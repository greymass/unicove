<script lang="ts">
	import { getContext } from 'svelte';

	import type { UnicoveContext } from '$lib/state/client.svelte.js';
	import Contract from '$lib/components/elements/contract.svelte';
	import Button from '$lib/components/button/button.svelte';

	const { data } = $props();
	const context = getContext<UnicoveContext>('state');
</script>

{#if context.wharf.session}
	<Button variant="secondary" href={`/${data.network}/upload/${data.contract}`} class="w-full">
		Upload Contract
	</Button>
{/if}

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
