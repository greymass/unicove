<script lang="ts">
	import { getContext } from 'svelte';
	// import { CircleCheck, CircleHelp } from 'lucide-svelte';

	import Button from '$lib/components/button/button.svelte';
	import { DD, DL, DLRow } from '$lib/components/descriptionlist/index.js';
	import { Stack, Switcher } from '$lib/components/layout/index.js';
	import type { UnicoveContext } from '$lib/state/client.svelte.js';
	import Account from '$lib/components/elements/account.svelte';
	import ActionCard from '$lib/components/elements/action.svelte';

	import { ApprovalManager } from './manager.svelte';

	let { data } = $props();

	let context = getContext<UnicoveContext>('state');

	const manager = $state(new ApprovalManager(context, data.proposal));
	$effect(() => {
		manager.sync(data.network, context.wharf);
	});
</script>

<Stack>
	<Switcher class="items-start gap-6" threshold="40rem">
		<Stack class="gap-4">
			<h2 class="h3">Requested Approvals</h2>

			<div
				id="msig-vis"
				class="rounded-2xl pb-4 pt-8"
				style="
				--bg-pos: calc(100% - {manager.approvalRatio}%); 
				--ease: {manager.userHasApproved ? 'ease-out' : 'ease-in'};
				--duration: {manager.userHasApproved ? '1000ms' : '200ms'}"
			>
				<div class="flex justify-between px-4 font-semibold">
					<div class="">
						<span class="flex items-center gap-1 text-3xl">
							<!-- TODO: Figure out how to clip these icons the same as the text -->
							<!-- <Check class="size-5 fill-inherit" />  -->
							{manager.totalApproved}
						</span>
						Approved
					</div>

					<div class="">
						<span class="flex items-center justify-end gap-1 text-3xl">
							<!-- TODO: Figure out how to clip these icons the same as the text -->
							<!-- <UserCheck class="size-5 fill-inherit" />  -->
							{manager.totalRequested}
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
					{#each manager.participants as participant}
						<tr class="h-12 bg-none">
							<td><Account name={participant.actor} /></td>
							<td class="text-muted">{participant.permission}</td>
							<td class="text-right">
								{#if manager.accountHasApproved(participant)}
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
					<DD>
						<Account name={manager.proposal.proposer} />
					</DD>
				</DLRow>
				<DLRow title={'Proposal Name'}>
					<DD>
						{manager.proposal.name}
					</DD>
				</DLRow>
				<DLRow title={manager.expired ? 'Expired' : 'Expiration'}>
					<DD>
						{manager.proposal.transaction.expiration} ({manager.expiresIn})
					</DD>
				</DLRow>
				<DLRow title={'Hash'}>
					<DD>
						{manager.proposal.hash}
					</DD>
				</DLRow>
			</DL>

			{#if manager.userIsApprover}
				{#if manager.userHasApproved}
					<Button
						variant="secondary"
						onclick={() => manager.unapprove()}
						disabled={context.wharf.transacting}>Unapprove</Button
					>
				{:else}
					<Button
						class="bg-green-400 text-green-950 hover:active:bg-green-500 [@media(any-hover:hover)]:hover:bg-green-300"
						variant="primary"
						onclick={() => manager.approve()}
						disabled={context.wharf.transacting}>Approve</Button
					>
				{/if}
			{/if}

			{#if manager.userIsProposer}
				<Button
					variant="secondary"
					disabled={context.wharf.transacting}
					onclick={() => manager.cancel()}>Cancel MSIG</Button
				>
			{/if}

			<Button
				variant="primary"
				disabled={context.wharf.transacting}
				onclick={() => manager.execute()}>Execute</Button
			>
		</Stack>
	</Switcher>

	<Stack>
		<h2 class="h3">Proposed Actions</h2>
		{#each manager.actions as action}
			<ActionCard {action} />
		{/each}
	</Stack>
</Stack>

{#if context.settings.data.debugMode}
	<pre>{JSON.stringify(manager.actions, null, 2)}</pre>
{/if}

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
