<script lang="ts">
	import { getContext } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { Button, Label, Stack, Switch } from 'unicove-components';
	import type { CreateSwitchProps } from '@melt-ui/svelte';

	import ProposalCard from '../components/ProposalCard.svelte';
	import StatusFilter from '../components/StatusFilter.svelte';
	import EmptyState from '../components/EmptyState.svelte';
	import type { UnicoveContext } from '$lib/state/client.svelte';
	import { SettingKeys } from '$lib/state/settings.svelte';

	const { data } = $props();
	const context = getContext<UnicoveContext>('state');

	const proposals = $derived(data.proposals);
	const hasMore = $derived(data.more);
	const currentStatus = $derived(data.status);

	// Get the account name being viewed from the page params
	const viewedAccountName = $derived(page.params.name);

	// Get the logged-in user's account name (if any)
	const loggedInAccountName = $derived(
		context.wharf.session ? String(context.wharf.session.actor) : undefined
	);

	// Determine which account's approvals we should check
	// If viewing own account, use own permissions; otherwise use viewed account
	const checkAccountName = $derived(
		loggedInAccountName && loggedInAccountName === viewedAccountName
			? loggedInAccountName
			: viewedAccountName
	);

	const checkPermission = $derived(
		loggedInAccountName && loggedInAccountName === viewedAccountName && context.wharf.session
			? context.wharf.session.permissionLevel
			: undefined
	);

	// Get showApproved state from settings, default to false
	let showApproved = $state(context.settings.get(SettingKeys.showApprovedProposals, false));

	// Client-side filtering based on showApproved toggle
	const filteredProposals = $derived.by(() => {
		if (showApproved) {
			return proposals;
		}
		// Filter out proposals where the account being viewed has already approved
		return proposals.filter((proposal) => {
			// If we have a specific permission to check (viewing own account while logged in)
			if (checkPermission) {
				const hasApproved = proposal.provided_approvals?.some(
					(approval) =>
						String(approval.actor) === String(checkPermission.actor) &&
						String(approval.permission) === String(checkPermission.permission)
				);
				return !hasApproved;
			}
			// Otherwise check by account name only
			const hasApproved = proposal.provided_approvals?.some(
				(approval) => String(approval.actor) === checkAccountName
			);
			return !hasApproved;
		});
	});

	function handleStatusChange(status: string) {
		const url = new URL(page.url);
		if (status === 'all') {
			url.searchParams.delete('status');
		} else {
			url.searchParams.set('status', status);
		}
		url.searchParams.delete('offset');
		goto(url.toString(), { replaceState: true });
	}

	const handleIncludeApprovedChange: CreateSwitchProps['onCheckedChange'] = ({ next }) => {
		showApproved = next || false;
		// Persist the setting
		context.settings.data.showApprovedProposals = showApproved;
		return next;
	};

	function loadMore() {
		const url = new URL(page.url);
		const newOffset = (data.offset || 0) + (data.limit || 20);
		url.searchParams.set('offset', String(newOffset));
		goto(url.toString());
	}
</script>

<Stack class="gap-4">
	<div class="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
		<h2 class="text-title">Proposals Pending Approval</h2>
		<div class="flex flex-wrap items-center gap-4">
			<Label for="show-approved">Show approved</Label>
			<Switch
				id="show-approved"
				checked={showApproved}
				onCheckedChange={handleIncludeApprovedChange}
			/>
			<StatusFilter value={currentStatus} onchange={handleStatusChange} />
		</div>
	</div>

	{#if data.error}
		<div class="text-error">Failed to load proposals: {data.error}</div>
	{:else if filteredProposals.length === 0}
		<EmptyState
			title="No proposals pending"
			message={showApproved ? 'No proposals found' : 'No proposals are currently awaiting approval'}
		/>
	{:else}
		<div class="grid gap-4">
			{#each filteredProposals as proposal}
				<ProposalCard {proposal} showApprovalStatus />
			{/each}
		</div>

		{#if hasMore}
			<Button onclick={loadMore} variant="secondary" class="place-self-center">Load More</Button>
		{/if}

		<p class="text-muted text-center text-sm">
			Showing {filteredProposals.length} of {data.total} total proposals
		</p>
	{/if}
</Stack>
