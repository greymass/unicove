<script lang="ts">
	import Stack from '$lib/components/layout/stack.svelte';
	import TextInput from '$lib/components/input/text.svelte';
	import Table from '$lib/components/contract/table.svelte';

	let filter = $state('');
	const { data } = $props();

	let filteredTables = $derived.by(() => {
		if (!filter) return data.abi.tables;
		return data.abi.tables.filter((table) => String(table.name).includes(filter));
	});
</script>

<Stack>
	<p>The data tables defined by this contract.</p>
	<TextInput bind:value={filter} autofocus placeholder="Filter tables..." />
	<ul class="grid grid-cols-[auto_1fr] gap-4 overflow-x-auto">
		{#each filteredTables as table}
			<Table abi={data.abi} contract={data.contract} {table} />
		{:else}
			{#if filter}
				<p>No actions match filter</p>
			{:else}
				<p>No actions</p>
			{/if}
		{/each}
	</ul>
</Stack>
