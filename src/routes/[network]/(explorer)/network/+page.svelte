<script lang="ts">
	import { onMount } from 'svelte';
	import { Card, Stack } from '$lib/components/layout';
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
			<table class="table-styles">
				<tbody>
					<tr>
						<td>Reversible Blocks</td>
						<td>{state.head_block_num.subtracting(state.last_irreversible_block_num)}</td>
					</tr>
					{#each Object.keys(state) as index}
						<tr>
							<td>{index}</td>
							<td>{state[index as keyof typeof state]}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		{/if}
	</Stack>
</Stack>
