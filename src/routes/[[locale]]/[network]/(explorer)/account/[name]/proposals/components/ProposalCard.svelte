<script lang="ts">
	import { getContext } from 'svelte';
	import { Card, Stack } from 'unicove-components';
	import Link from '$lib/components/elements/link.svelte';
	import Account from '$lib/components/elements/account.svelte';
	import type { UnicoveContext } from '$lib/state/client.svelte';
	import type { Proposal } from '@wharfkit/msigs';
	import dayjs from 'dayjs';
	import relativeTime from 'dayjs/plugin/relativeTime';

	dayjs.extend(relativeTime);

	interface ProposalCardProps {
		proposal: Proposal;
		showApprovalStatus?: boolean;
	}

	const { proposal, showApprovalStatus = false }: ProposalCardProps = $props();
	const context = getContext<UnicoveContext>('state');
	const { urlPath } = context;

	const statusColors = {
		proposed: 'bg-primary text-on-primary',
		executed: 'bg-success text-on-success',
		cancelled: 'bg-surface-variant text-on-surface-variant',
		expired: 'bg-error text-on-error'
	};

	const statusColor = $derived(statusColors[proposal.status] || statusColors.proposed);

	const expirationDate = $derived(dayjs(String(proposal.expiration)));
	const isExpired = $derived(expirationDate.isBefore(dayjs()));
	const expirationText = $derived(
		isExpired ? `Expired ${expirationDate.fromNow()}` : `Expires ${expirationDate.fromNow()}`
	);

	const approvalProgress = $derived(
		proposal.approvals_required && proposal.approvals_received
			? Math.round((proposal.approvals_received / proposal.approvals_required) * 100)
			: 0
	);

	const userHasApproved = $derived.by(() => {
		if (!showApprovalStatus || !context.wharf.session) return false;
		const userPermission = context.wharf.session.permissionLevel;
		return (
			proposal.provided_approvals?.some(
				(approval) =>
					String(approval.actor) === String(userPermission.actor) &&
					String(approval.permission) === String(userPermission.permission)
			) || false
		);
	});
</script>

<Card class="@container">
	<Stack class="gap-4">
		<div class="flex flex-wrap items-start justify-between gap-2">
			<div class="flex flex-col gap-1">
				<Link
					href={urlPath(`/msig/${proposal.proposer}/${proposal.proposal_name}`)}
					class="text-xl font-semibold"
				>
					{String(proposal.proposal_name)}
				</Link>
				<div class="text-muted flex items-center gap-2 text-sm">
					<span>Proposed by</span>
					<Account name={proposal.proposer} />
				</div>
			</div>
			<span class={`rounded-full px-3 py-1 text-sm font-medium capitalize ${statusColor}`}>
				{proposal.status}
			</span>
		</div>

		<div class="grid gap-2 @md:grid-cols-2 @lg:grid-cols-4">
			{#if proposal.approvals_required && proposal.approvals_received}
				<div>
					<div class="text-muted text-sm">Approval Progress</div>
					<div class="mt-1 flex items-center gap-2">
						<div class="bg-surface-variant h-2 flex-1 overflow-hidden rounded-full">
							<div
								class="bg-primary h-full transition-all"
								style="width: {approvalProgress}%"
							></div>
						</div>
						<span class="text-sm font-medium">
							{proposal.approvals_received}/{proposal.approvals_required}
						</span>
					</div>
				</div>
			{/if}

			<div>
				<div class="text-muted text-sm">Expiration</div>
				<div class="mt-1 text-sm font-medium" class:text-error={isExpired}>
					{expirationText}
				</div>
			</div>

			<div>
				<div class="text-muted text-sm">Actions</div>
				<div class="mt-1 text-sm font-medium">{proposal.actions_count} action(s)</div>
			</div>

			<div>
				<div class="text-muted text-sm">Created</div>
				<div class="mt-1 text-sm font-medium">
					{dayjs(String(proposal.created_at)).format('MMM D, YYYY')}
				</div>
			</div>
		</div>

		{#if showApprovalStatus && context.wharf.session}
			<div class="border-outline-variant flex items-center gap-2 border-t pt-3">
				{#if userHasApproved}
					<span class="text-success text-sm font-medium">✓ You have approved this proposal</span>
				{:else}
					<span class="text-warning text-sm font-medium">⚠ Pending your approval</span>
				{/if}
			</div>
		{/if}
	</Stack>
</Card>
