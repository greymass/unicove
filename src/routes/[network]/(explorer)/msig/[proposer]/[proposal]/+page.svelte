<script lang="ts">
	import Button from '$lib/components/button/button.svelte';
	import { DL, DLRow } from '$lib/components/descriptionlist/index.js';
	import { MultiCard, Stack } from '$lib/components/layout/index.js';
	import type { UnicoveContext } from '$lib/state/client.svelte.js';
	import { getContext } from 'svelte';
	import { Name, PermissionLevel } from '@wharfkit/antelope';
	import dayjs from 'dayjs';
	import relativeTime from 'dayjs/plugin/relativeTime';
	import Account from '$lib/components/elements/account.svelte';
	import { CircleCheck, CircleHelp } from 'lucide-svelte';
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
		total_approvals.some((a) => wharf.session && a.equals(wharf.session.permissionLevel))
	);

	let userIsProposer = $derived(wharf.session?.actor.equals(Name.from(proposal.proposer)));

	let transacting = $derived(manager.transacting);
	let userHasApproved = $derived(manager.approved);

	// Expiry date
	let relativeTimeToExpiry = $derived(dayjs(proposal.transaction.expiration.toDate()).fromNow());
	let proposalExpired = $derived(dayjs(proposal.transaction.expiration.toDate()).isBefore());

	// Approval statistics
	let totalRequested = $derived(total_approvals.length);
	let totalApproved = $derived(provided_approvals.length);
	let ratioApproved = $derived((totalApproved / totalRequested) * 100);

	// Actions
	const handleApprove = () => manager.approve();
	const handleUnapprove = () => manager.unapprove();
	const handleExecute = () => manager.execute();
	const handleCancel = () => manager.cancel();
</script>

<MultiCard>
	<Stack class="gap-4">
		<h2 class="h3">Requested Approvals</h2>

		<div
			id="msig-vis"
			class="rounded-2xl pb-4 pt-8"
			style="
		--bg-pos: calc(100% - {ratioApproved}%); 
		--ease: {userHasApproved ? 'ease-out' : 'ease-in'};
		--duration: {userHasApproved ? '1000ms' : '200ms'}"
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
					<tr class="h-12 bg-none">
						<td><Account name={requested.actor} /></td>
						<td class="text-muted">{requested.permission}</td>
						<td class="text-right">
							{#if accountHasApproved(requested)}
								<span class="text-green-300">Approved</span>
							{:else}
								<span class="text-muted">Requested</span>
							{/if}
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</Stack>

	<Stack class="gap-4" id="details">
		<h2 class="h3">Multisig Details</h2>

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

		{#if userIsApprover}
			{#if userHasApproved}
				<Button variant="secondary" onclick={handleUnapprove} disabled={transacting}
					>Unapprove</Button
				>
			{:else}
				<Button variant="primary" onclick={handleApprove} disabled={transacting}>Approve</Button>
			{/if}
		{/if}

		{#if userIsProposer}
			<Button variant="secondary" onclick={handleCancel}>Cancel MSIG</Button>
		{/if}

		<Button variant="primary" onclick={handleExecute}>Execute</Button>
	</Stack>

	<Stack class="[column-span:all]">
		<h2 class="h3">Proposed Actions</h2>
		{#each proposal.actions as action}
			<ActionCard data={action} />
		{/each}
	</Stack>
</MultiCard>

<style lang="postcss">
	#msig-vis {
		background: linear-gradient(
			to right,
			theme(colors.green.400) 50%,
			theme(colors.mineShaft.950) 50%
		);
		background-size: 200% 100%;
		background-position: var(--bg-pos);
		transition: all var(--ease) var(--duration);
	}
	#msig-vis > div {
		background: linear-gradient(to right, theme(colors.green.950) 50%, theme(colors.zinc.400) 50%);
		background-size: 200% 100%;
		background-position: var(--bg-pos);
		background-clip: text;
		color: transparent;
		transition: all var(--ease) var(--duration);
	}
</style>
