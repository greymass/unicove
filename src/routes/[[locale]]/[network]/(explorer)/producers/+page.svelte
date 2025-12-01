<script lang="ts">
	import { onMount } from 'svelte';
	import { Button, Card, Chip, Stack } from 'unicove-components';
	import AccountLink from '$lib/components/elements/account.svelte';
	import VoteWeight from '$lib/components/elements/voteweight.svelte';
	import type { PageData } from './$types';

	interface Props {
		data: PageData;
	}

	const { data }: Props = $props();

	onMount(() => {
		const interval = setInterval(() => {
			data.producersState.loadProducers();
		}, 60000);

		return () => {
			clearInterval(interval);
		};
	});
</script>

<div class="space-y-6">
	<Card title="Active Block Producers">
		{#if data.producersState.loading}
			<div class="py-12 text-center">
				<p class="text-on-surface-variant">Loading producers...</p>
			</div>
		{:else if data.producersState.error}
			<Stack>
				<p class="text-on-error-container">{data.producersState.error}</p>
				<Button onclick={() => data.producersState.loadProducers()}>Try Again</Button>
			</Stack>
		{:else if data.producersState.activeProducers.length === 0}
			<div class="py-12 text-center">
				<p class="text-on-surface-variant">No active producers found</p>
			</div>
		{:else}
			<table class="table-styles table-fixed">
				<thead>
					<tr>
						<th class="w-10 text-center">#</th>
						<th class="w-20"></th>
						<th>Actor</th>
						<th class="w-40 text-right">Votes</th>
						<th class="w-32">Website</th>
					</tr>
				</thead>
				<tbody>
					{#each data.producersState.activeProducers as producer, index}
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
								<div class="flex flex-col items-end">
									<VoteWeight weight={producer.total_votes} variant="short" />
									<span class="text-on-surface-variant text-sm">
										{data.producersState.totalVotes > 0
											? (
													(Number(producer.total_votes) / data.producersState.totalVotes) *
													100
												).toFixed(2)
											: '0.00'}%
									</span>
								</div>
							</td>
							<td>
								{#if producer.url}
									<a
										href={producer.url}
										target="_blank"
										rel="noopener noreferrer"
										class="text-primary hover:underline"
									>
										Website
									</a>
								{:else}
									<span class="text-muted">-</span>
								{/if}
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
			{#if data.producersState.hasMore && !data.producersState.showAll}
				<div class="flex justify-center pt-4">
					<Button variant="secondary" onclick={() => data.producersState.loadMore()}>
						Load More
					</Button>
				</div>
			{/if}
		{/if}
	</Card>
</div>
