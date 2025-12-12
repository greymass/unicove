<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { Button, Stack } from 'unicove-components';

	import ProposalCard from '../components/ProposalCard.svelte';
	import StatusFilter from '../components/StatusFilter.svelte';
	import EmptyState from '../components/EmptyState.svelte';

	const { data } = $props();

	const proposals = $derived(data.proposals);
	const hasMore = $derived(data.more);
	const currentStatus = $derived(data.status);
	const includeApproved = $derived(data.includeApproved);

	function handleStatusChange(status: string) {
		const url = new URL($page.url);
		url.searchParams.set('status', status);
		url.searchParams.delete('offset');
		goto(url.toString());
	}

	function handleIncludeApprovedChange(event: Event) {
		const checked = (event.target as HTMLInputElement).checked;
		const url = new URL($page.url);
		url.searchParams.set('include_approved', String(checked));
		url.searchParams.delete('offset');
		goto(url.toString());
	}

	function loadMore() {
		const url = new URL($page.url);
		const newOffset = (data.offset || 0) + (data.limit || 20);
		url.searchParams.set('offset', String(newOffset));
		goto(url.toString());
	}
</script>

<Stack class="gap-4">
	<div class="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
		<h2 class="text-title">Proposals Pending Approval</h2>
		<div class="flex flex-wrap items-center gap-4">
			<label class="flex items-center gap-2">
				<input type="checkbox" checked={includeApproved} onchange={handleIncludeApprovedChange} />
				<span>Show approved</span>
			</label>
			<StatusFilter value={currentStatus} onchange={handleStatusChange} />
		</div>
	</div>

	{#if data.error}
		<div class="text-error">Failed to load proposals: {data.error}</div>
	{:else if proposals.length === 0}
		<EmptyState
			title="No proposals pending"
			message={includeApproved
				? 'No proposals found'
				: 'No proposals are currently awaiting your approval'}
		/>
	{:else}
		<div class="grid gap-4">
			{#each proposals as proposal}
				<ProposalCard {proposal} showApprovalStatus />
			{/each}
		</div>

		{#if hasMore}
			<Button onclick={loadMore} variant="secondary" class="place-self-center">Load More</Button>
		{/if}

		<p class="text-muted text-center text-sm">
			Showing {proposals.length} of {data.total} total proposals
		</p>
	{/if}
</Stack>
