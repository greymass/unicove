<script lang="ts">
	import Button from '$lib/components/button/button.svelte';
	import { DL, DLRow } from '$lib/components/descriptionlist/index.js';
	import { MultiCard, Stack } from '$lib/components/layout/index.js';
	import type { UnicoveContext } from '$lib/state/client.svelte.js';
	import { PermissionLevel } from '@wharfkit/antelope';
	import { getContext } from 'svelte';
	import dayjs from 'dayjs';
	import relativeTime from 'dayjs/plugin/relativeTime';
	import Account from '$lib/components/elements/account.svelte';
	import { percentString } from '$lib/utils';
	// import { Check, UserCheck } from 'lucide-svelte';
	import { ApprovalManager } from './manager.svelte';
	import ActionCard from '$lib/components/elements/action.svelte';

	dayjs.extend(relativeTime);

	let { data } = $props();
	let { proposal } = $derived(data);

	let context = getContext<UnicoveContext>('state');
	let { wharf } = $derived(context);

	const manager = $state(new ApprovalManager(data.network, data.proposal));
	$effect(() => {
		if (context.account) {
			manager.sync(data.network, context.wharf);
		}
	});

	let { requested_approvals, provided_approvals } = $derived(proposal.approvals);
	let total_approvals = $derived([...provided_approvals, ...requested_approvals]);

	const accountHasApproved = (account?: PermissionLevel) => {
		if (!account) return false;
		return provided_approvals.some((a) => a.equals(account));
	};

	let userIsApprover = $derived(
		requested_approvals.some((a) => wharf.session && a.equals(wharf.session.permissionLevel))
	);

	let userHasApproved = $derived(
		accountHasApproved(wharf.session?.permissionLevel) || !!manager.txid
	);

	// Expiry date
	let relativeTimeToExpiry = $derived(dayjs(proposal.transaction.expiration.toDate()).fromNow());
	let proposalExpired = $derived(dayjs(proposal.transaction.expiration.toDate()).isBefore());

	// Approval statistics
	let totalRequested = $derived(total_approvals.length);
	let totalApproved = $derived(provided_approvals.length);
	let ratioApproved = $derived(totalApproved / totalRequested);

	// Actions
	const handleApprove = () => manager.approve();
	const handleUnapprove = () => manager.unapprove();
	const handleExecute = () => manager.execute();
</script>

<MultiCard>
	<div
		id="msig-vis"
		class="rounded-xl pb-4 pt-10"
		style={`column-span:all;--bg-pos: calc(100% - ${percentString(ratioApproved)})`}
	>
		<div class="flex justify-between px-4 font-semibold">
			<div class="">
				<span class="flex items-center gap-1 text-3xl">
					<!-- TODO: Figure out how to clip these icons the same as the text -->
					<!-- <Check class="size-5 fill-inherit" />  -->
					{totalApproved}
				</span>
				Approved
			</div>

			<div class="">
				<span class="flex items-center justify-end gap-1 text-3xl">
					<!-- TODO: Figure out how to clip these icons the same as the text -->
					<!-- <UserCheck class="size-5 fill-inherit" />  -->
					{totalRequested}
				</span>
				Requested
			</div>
		</div>
	</div>

	<Stack>
		<h2 class="h3">Requested Approvals</h2>

		<table class="table-styles">
			<thead>
				<tr>
					<th class="text-left">Actor</th>
					<th class="text-left">Permission</th>
					<th class="text-right">Status</th>
				</tr>
			</thead>
			<tbody>
				{#each total_approvals as requested}
					<tr class="h-12">
						<td><Account name={requested.actor} /></td>
						<td class="text-muted">{requested.permission}</td>
						<td class="text-right">
							{@render approvalCard(accountHasApproved(requested))}
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</Stack>

	<Stack>
		<h2 class="h3">Proposed Actions</h2>
		{#each proposal.actions as action}
			<ActionCard data={action} />
		{/each}
	</Stack>

	<Stack class="gap-4" id="details">
		<h2 class="h3">Details</h2>

		<DL>
			<DLRow title={'Proposer'}>
				<Account name={proposal.proposer} />
			</DLRow>
			<DLRow title={'Proposal Name'}>
				{proposal.name}
			</DLRow>
			<DLRow title={proposalExpired ? 'Expired' : 'Expiration'}>
				{proposal.transaction.expiration} ({relativeTimeToExpiry})
			</DLRow>
			<DLRow title={'Hash'}>
				{proposal.hash}
			</DLRow>
		</DL>
	</Stack>

	{#if userIsApprover}
		{#if userHasApproved}
			<Button variant="secondary" onclick={handleUnapprove}>Unapprove</Button>
		{:else}
			<Button variant="primary" onclick={handleApprove}>Approve</Button>
		{/if}
	{/if}

	<Button variant="primary" onclick={handleExecute} disabled={proposalExpired}>Execute</Button>
</MultiCard>

{#snippet approvalCard(approved?: boolean)}
	{#if approved}
		<span class="rounded-md bg-green-300 px-2 py-1 text-green-950">Approved</span>
	{:else}
		<span class="text-muted">Pending</span>
	{/if}
{/snippet}

<style lang="postcss">
	#msig-vis {
		background: linear-gradient(
			to right,
			theme(colors.green.400) 50%,
			theme(colors.mineShaft.950) 50%
		);
		background-size: 200% 100%;
		background-position: var(--bg-pos, 100%);
	}
	#msig-vis > div {
		background: linear-gradient(to right, theme(colors.green.900) 50%, theme(colors.zinc.400) 50%);
		background-size: 200% 100%;
		background-position: var(--bg-pos, 100%);
		background-clip: text;
		color: transparent;
	}
</style>
