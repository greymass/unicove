<script lang="ts">
	import { onMount } from 'svelte';
	import { Card, Stack, Table, TD, TR } from 'unicove-components';
	import { API } from '@wharfkit/antelope';
	// import Pageheader from '$lib/components/pageheader.svelte';

	const { data } = $props();

	let state: API.v1.GetInfoResponse | undefined = $state();

	onMount(() => {
		updateState();
		const stateInterval = setInterval(updateState, 1000);

		return () => {
			clearInterval(stateInterval);
		};
	});

	async function updateState() {
		state = await data.network.client.v1.chain.get_info();
	}
</script>

<Stack class="gap-8">
	<Card>Network charts/metrics</Card>

	<Stack>
		{#if state}
			<Table>
				<TR>
					<TD>Reversible Blocks</TD>
					<TD>{state.head_block_num.subtracting(state.last_irreversible_block_num)}</TD>
				</TR>
				{#each Object.keys(state) as index}
					<TR>
						<TD>{index}</TD>
						<TD>{state[index as keyof typeof state]}</TD>
					</TR>
				{/each}
			</Table>
		{/if}
	</Stack>
</Stack>
