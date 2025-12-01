<script lang="ts">
	import { onMount } from 'svelte';
	import { Chip } from 'unicove-components';
	import AccountLink from '$lib/components/elements/account.svelte';

	const { data } = $props();

	const producers = $derived(data.producersState.activeProducers);
	const totalVotes = $derived(data.producersState.totalVotes);

	onMount(() => {
		const interval = setInterval(() => {
			data.producersState.loadProducers();
		}, 60000);

		return () => {
			clearInterval(interval);
		};
	});
</script>

<table class="table-styles table-fixed">
	<thead>
		<tr>
			<th class="w-10 text-center">#</th>
			<th class="w-20"></th>
			<th>Actor</th>
			<th class="w-20 text-right">Votes</th>
		</tr>
	</thead>
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
					{((Number(producer.total_votes) / totalVotes) * 100).toFixed(2)}%
				</td>
			</tr>
		{/each}
	</tbody>
</table>
