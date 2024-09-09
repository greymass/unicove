<script lang="ts">
	import * as m from '$lib/paraglide/messages.js';
	import Code from '$lib/components/code.svelte';
	import { onMount } from 'svelte';
	import * as Table from '$lib/components/table';
	import { Card, Stack } from '$lib/components/layout';
	import { API } from '@wharfkit/antelope';
	import Button from '$lib/components/button/button.svelte';
	import Pageheader from '$lib/components/pageheader.svelte';

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
		console.log('update state');
		state = await data.network.client.v1.chain.get_info();
	}
</script>

<Stack class="gap-8">
	<Pageheader title="Network" subtitle="Network Overview" />
	<Card>Network charts/metrics</Card>

	<Stack>
		{#if state}
			<Table.Root class="table-auto">
				<Table.Body>
					<Table.Row>
						<Table.Cell>Reversible Blocks</Table.Cell>
						<Table.Cell
							>{state.head_block_num.subtracting(state.last_irreversible_block_num)}</Table.Cell
						>
					</Table.Row>
					{#each Object.keys(state) as index}
						<Table.Row>
							<Table.Cell>{index}</Table.Cell>
							<Table.Cell>{state[index]}</Table.Cell>
						</Table.Row>
					{/each}
				</Table.Body>
			</Table.Root>
		{/if}
	</Stack>
</Stack>
