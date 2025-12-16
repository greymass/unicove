<script lang="ts">
	import { getContext } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { Button, Stack } from 'unicove-components';

	import ProposalCard from './components/ProposalCard.svelte';
	import StatusFilter from './components/StatusFilter.svelte';
	import EmptyState from './components/EmptyState.svelte';
	import type { UnicoveContext } from '$lib/state/client.svelte';

	const { data } = $props();
	const context = getContext<UnicoveContext>('state');

	// Accumulate proposals data for infinite scroll
	let allProposals = $state(data.proposals);
	let currentOffset = $state(data.offset);
	let hasMore = $state(data.more);
	let isLoading = $state(false);

	const currentStatus = $derived(data.status);

	// Reset accumulated data when filters change
	$effect(() => {
		allProposals = data.proposals;
		currentOffset = data.offset;
		hasMore = data.more;
	});

	function handleStatusChange(status: string) {
		const url = new URL(page.url);
		if (status === 'proposed') {
			url.searchParams.delete('status');
		} else {
			url.searchParams.set('status', status);
		}
		url.searchParams.delete('offset'); // Reset to first page
		goto(url.toString(), { replaceState: true });
	}

	async function loadMore() {
		if (isLoading) return;

		isLoading = true;
		try {
			const newOffset = currentOffset + (data.limit || 20);
			const response = await context.network.msigs.get_proposals(data.name, {
				status: currentStatus === 'all' ? undefined : currentStatus,
				limit: data.limit || 20,
				offset: newOffset
			});

			// Append new proposals to existing data
			allProposals = [...allProposals, ...response.proposals];
			currentOffset = newOffset;
			hasMore = response.more;
		} catch (error) {
			console.error('Error loading more proposals:', error);
		} finally {
			isLoading = false;
		}
	}
</script>

<Stack class="gap-4">
	<div class="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
		<h2 class="text-title">Proposals Created</h2>
		<StatusFilter value={currentStatus} onchange={handleStatusChange} />
	</div>

	{#if data.error}
		<div class="text-error">Failed to load proposals: {data.error}</div>
	{:else if allProposals.length === 0}
		<EmptyState
			title="No proposals found"
			message={currentStatus === 'all'
				? "This account hasn't created any multisig proposals yet"
				: `No ${currentStatus} proposals found`}
		/>
	{:else}
		<div class="grid gap-4">
			{#each allProposals as proposal, index (`${proposal.proposer}-${proposal.proposal_name}-${index}`)}
				<ProposalCard {proposal} />
			{/each}
		</div>

		{#if hasMore}
			<Button onclick={loadMore} variant="secondary" class="place-self-center" disabled={isLoading}>
				{isLoading ? 'Loading...' : 'Load More'}
			</Button>
		{/if}

		<p class="text-muted text-label-sm text-center">
			Showing {allProposals.length} of {data.total} total proposals
		</p>
	{/if}
</Stack>
