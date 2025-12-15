<script lang="ts">
	import { getContext } from 'svelte';
	import { Card, Chip, Cluster, cn, Stack } from 'unicove-components';
	import Account from '$lib/components/elements/account.svelte';
	import type { UnicoveContext } from '$lib/state/client.svelte';
	import type { Proposal } from '@wharfkit/msigs';
	import dayjs from 'dayjs';

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
		cancelled: 'bg-surface-container-high text-on-surface-variant',
		expired: 'bg-error text-on-error'
	};

	const statusColor = $derived(statusColors[proposal.status] || statusColors.proposed);

	const expirationDate = $derived(dayjs(String(proposal.expiration)));
	const isExpired = $derived(expirationDate.isBefore(dayjs()));
	const expirationText = $derived(
		isExpired ? `Expired ${expirationDate.fromNow()}` : `Expires ${expirationDate.fromNow()}`
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

<a
	href={urlPath(`/msig/${proposal.proposer}/${proposal.proposal_name}`)}
	class="group block hover:cursor-pointer"
>
	<Card class="group-hover:bg-surface-container @container">
		<Stack class="gap-6">
			<div class="flex flex-wrap items-start justify-between gap-2">
				<div class="flex flex-col gap-2">
					<h3 class="text-headline text-primary">
						{String(proposal.proposal_name)}
					</h3>
					<span class="text-muted text-label-sm">
						Proposed by {proposal.proposer}
					</span>
				</div>

				<Cluster>
					<Chip class={cn('capitalize', statusColor)}>{proposal.status}</Chip>
					{#if showApprovalStatus && context.wharf.session}
						{#if userHasApproved}
							<Chip class="text-on-success bg-success">Approved</Chip>
						{:else}
							<Chip class="text-on-warning bg-warning">Pending Approval</Chip>
						{/if}
					{/if}
				</Cluster>
			</div>

			<div class="grid items-start gap-2 @md:grid-cols-2 @lg:grid-cols-4 @3xl:grid-cols-5">
				{#if proposal.approvals_required}
					<div class="grid gap-1">
						<div class="text-muted text-label-sm">Approvals</div>

						<span class="text-body">
							{proposal.approvals_received}/{proposal.approvals_required}
						</span>
					</div>
				{/if}

				<div class="grid gap-1">
					<div class="text-muted text-label-sm">Expiration</div>
					<div class="text-body leading-5 text-pretty">
						{expirationText}
					</div>
				</div>

				<div class="grid gap-1">
					<div class="text-muted text-label-sm">Actions</div>
					<div class="text-body">
						{proposal.actions_count}
						{#if proposal.actions_count === 1}
							action
						{:else}
							actions
						{/if}
					</div>
				</div>

				<div class="grid gap-1">
					<div class="text-muted text-label-sm">Created</div>
					<div class="text-body">
						{dayjs(String(proposal.created_at)).format('MMM D, YYYY')}
					</div>
				</div>
			</div>
		</Stack>
	</Card>
</a>
