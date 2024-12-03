<script lang="ts">
	import Button from '$lib/components/button/button.svelte';
	import Code from '$lib/components/code.svelte';
	import { DL, DLRow } from '$lib/components/descriptionlist/index.js';
	import { MultiCard, Stack } from '$lib/components/layout/index.js';
	import type { UnicoveContext } from '$lib/state/client.svelte.js';
	import { Name } from '@wharfkit/antelope';
	import { getContext } from 'svelte';
	import dayjs from 'dayjs';
	import relativeTime from 'dayjs/plugin/relativeTime'; // ES 2015
	import Account from '$lib/components/elements/account.svelte';
	import { percentString } from '$lib/utils';
	import { Check, UserCheck } from 'lucide-svelte';

	dayjs.extend(relativeTime);

	let { data } = $props();
	let { proposal } = $derived(data);

	let context = getContext<UnicoveContext>('state');
	let { account } = $derived(context);

	function nameHasApproved(name: Name) {
		return data.provided_names.some((actor) => actor.equals(name));
	}

	let userIsApprover = $derived(
		data.requested_names.some((actor) => account?.name && actor.equals(account.name))
	);

	let userHasApproved = $derived((account?.name && nameHasApproved(account.name)) || false);

	let userIsProposer = $derived(account?.name?.equals(Name.from(proposal.proposer)) || false);

	let relativeTimeToExpiry = $derived(dayjs(proposal.transaction.expiration.toDate()).fromNow());
	let alreadyExpired = $derived(dayjs(proposal.transaction.expiration.toDate()).isBefore());

	let totalRequested = $derived(data.requested_names.length);
	let totalApproved = $derived(data.provided_names.length);
	let percentApproved = $derived(totalApproved / totalRequested);
</script>

<MultiCard>
	<div
		id="msig-vis"
		class="rounded-xl pb-4 pt-10"
		style={`column-span:all;--bg-pos: calc(100% - ${percentString(percentApproved)})`}
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

		<table>
			<thead>
				<tr class="text-muted">
					<th class="text-left">Actor</th>
					<th class="text-left">Permission</th>
					<th class="text-right">Status</th>
				</tr>
			</thead>
			<tbody>
				{#each proposal.approvals.requested_approvals as requested}
					{@const { actor, permission } = requested.level}
					<tr class="h-12">
						<td><Account name={actor} /></td>
						<td>{permission}</td>
						<td class="text-right">
							{@render approvalCard(nameHasApproved(Name.from(actor)))}
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</Stack>

	<Stack>
		<h2 class="h3">Proposed Actions</h2>
		{#each proposal.transaction.actions as action}
			<Code>{JSON.stringify(action, null, 2)}</Code>
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
			<DLRow title={alreadyExpired ? 'Expired' : 'Expiration'}>
				{proposal.transaction.expiration} ({relativeTimeToExpiry})
			</DLRow>
			<DLRow title={'Hash'}>
				{proposal.hash}
			</DLRow>
		</DL>

		<!-- <Switcher></Switcher> -->
	</Stack>

	<!-- {#if userIsApprover && !alreadyExpired} -->
	{#if userIsApprover}
		{#if userHasApproved}
			<Button variant="secondary">UnApprove</Button>
		{:else}
			<Button variant="primary">Approve</Button>
		{/if}
	{/if}

	{#if userIsProposer && !alreadyExpired}
		<Button variant="primary">Execute</Button>
	{/if}
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
		background: linear-gradient(
			to right,
			theme(colors.green.900) 50%,
			theme(colors.mineShaft.300) 50%
		);
		background-size: 200% 100%;
		background-position: var(--bg-pos, 100%);
		background-clip: text;
		color: transparent;
	}
</style>
