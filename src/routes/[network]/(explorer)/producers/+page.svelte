<script lang="ts">
	import { onMount } from 'svelte';
	import { getProducersRecursive } from '../../api/producers/utils.js';
	import * as SystemContract from '$lib/wharf/contracts/system';
	import Chip from '$lib/components/chip.svelte';
	import AccountLink from '$lib/components/elements/account.svelte';

	const { data } = $props();

	let state: SystemContract.Types.producer_info[] | undefined = $state();

	onMount(() => {
		updateState();
		const stateInterval = setInterval(updateState, 1000);

		return () => {
			clearInterval(stateInterval);
		};
	});

	async function updateState() {
		state = await getProducersRecursive(data.network);
	}

	const producers = $derived(
		state
			?.filter((producer) => producer.is_active)
			.filter((producer) => producer.total_votes.value > 0)
			.toSorted((a, b) => {
				return a.total_votes.value > b.total_votes.value ? -1 : 1;
			}) ?? []
	);

	const votes = $derived(producers.reduce((acc, p) => acc + p.total_votes.value, 0) || 0);
</script>

<table class="table-styles table-fixed">
	<thead>
		<tr>
			<th class="w-10 text-center">#</th>
			<th class="w-20">Status</th>
			<th>Account</th>
			<th class="w-20 text-right">Votes</th>
		</tr>
	</thead>
	{#if state}
		<tbody>
			{#each producers as producer, index}
				<tr>
					<td class="text-center">
						{index + 1}
					</td>
					<td>
						{#if index < 21}
							<Chip class="bg-success-container text-on-success-container">Top 21</Chip>
						{:else}
							<Chip class="bg-surface-variant text-on-surface-variant">Standby</Chip>
						{/if}
					</td>
					<td>
						<AccountLink name={producer.owner} />
					</td>
					<td class="text-right">
						{((producer.total_votes.value / votes) * 100).toFixed(2)}%
					</td>
				</tr>
			{/each}
		</tbody>
	{/if}
</table>
