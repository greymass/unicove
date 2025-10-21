<script lang="ts">
	import { getContext } from 'svelte';

	import { Button } from 'unicove-components';
	import { DD, DL, DLRow } from 'unicove-components';
	import { Stack, Switcher } from 'unicove-components';
	import type { UnicoveContext } from '$lib/state/client.svelte.js';
	import Account from '$lib/components/elements/account.svelte';
	import ActionCard from '$lib/components/elements/action.svelte';
	import SelectActionVariant from '$lib/components/select/actionvariant.svelte';
	import TransactForm from '$lib/components/transact/form.svelte';

	import { ApprovalManager } from './manager.svelte';
	import type { ActionDisplayVariants } from '$lib/types';
	import { goto } from '$lib/utils';
	import { getActionSummaryComponent } from '$lib/components/summary';

	let { data } = $props();

	let context = getContext<UnicoveContext>('state');

	const manager = $state(new ApprovalManager(context, data.proposal));
	$effect(() => {
		manager.sync(data.network, context.wharf);
	});

	const top21 = data.producers.splice(0, 21);

	let variant = $derived(context.settings.data.actionDisplayVariant as ActionDisplayVariants);

	async function cancel() {
		await manager.cancel();
		goto(`/${data.network}/account/${data.proposal.proposer}/proposals`, {
			invalidateAll: true
		});
	}
</script>

{#snippet Complete()}
	<div class="flex gap-4">
		<Button onclick={() => manager.reset()}>Back</Button>
	</div>
{/snippet}

<Stack class="mt-6">
	<Switcher class="items-start gap-6" threshold="40rem">
		<Stack class="gap-4">
			<h2 class="text-title">Requested Approvals</h2>

			<div
				id="msig-vis"
				class="rounded-2xl pt-8 pb-4"
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
						<th class="text-left">Role</th>
						<th class="text-right">Status</th>
					</tr>
				</thead>
				<tbody>
					{#each manager.participants as participant}
						{@const isProducer = data.producers.includes(String(participant.actor))}
						{@const isTop21 = top21.includes(String(participant.actor))}
						<tr class="h-12 bg-none">
							<td><Account name={participant.actor} /></td>
							<td class="text-muted">{participant.permission}</td>
							<td>
								{#if isTop21}
									Top 21
								{:else if isProducer}
									Standby
								{:else}
									Signer
								{/if}
							</td>
							<td class="text-right">
								{#if manager.accountHasApproved(participant)}
									<span class="text-success">Approved</span>
								{:else}
									<span class="text-muted">Requested</span>
								{/if}
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</Stack>

		<TransactForm
			id={manager.result?.resolved?.transaction.id}
			error={manager.error}
			onsuccess={Complete}
			onfailure={Complete}
		>
			<Stack class="gap-4" id="details">
				<h2 class="text-title">Multisig Details</h2>

				<DL>
					<DLRow title="Proposer">
						<DD>
							<Account name={manager.proposal.proposer} />
						</DD>
					</DLRow>
					<DLRow title="Proposal Name">
						<DD>
							{manager.proposal.name}
						</DD>
					</DLRow>
					<DLRow title={manager.expired ? 'Expired' : 'Expiration'}>
						<DD>
							{manager.proposal.transaction.expiration} ({manager.expiresIn})
						</DD>
					</DLRow>
					<DLRow title="Hash">
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
							class="bg-success text-on-success"
							variant="primary"
							onclick={() => manager.approve()}
							disabled={context.wharf.transacting}>Approve</Button
						>
					{/if}
				{/if}

				{#if manager.userIsProposer}
					<Button variant="secondary" disabled={context.wharf.transacting} onclick={cancel}
						>Cancel MSIG</Button
					>
				{/if}

				<Button
					variant="primary"
					disabled={context.wharf.transacting}
					onclick={() => manager.execute()}>Execute</Button
				>
			</Stack>
		</TransactForm>
	</Switcher>

	<Stack>
		<h2 class="text-title">Proposed Actions ({variant})</h2>
		<SelectActionVariant />
		{#each manager.readable as decodedAction}
			{@const contract = String(decodedAction.action.account)}
			{@const action = String(decodedAction.action.name)}
			{@const summary = getActionSummaryComponent(contract, action, decodedAction.action.data)}
			<ActionCard
				action={decodedAction.action}
				objectified={decodedAction.readable?.data}
				{summary}
				{variant}
			/>
		{/each}
	</Stack>
</Stack>

{#if context.settings.data.debugMode}
	<pre>{JSON.stringify(manager.actions, null, 2)}</pre>
{/if}

<style>
	#msig-vis {
		background: linear-gradient(
			to right,
			var(--color-success) 50%,
			var(--color-surface-container) 50%
		);
		background-size: 200% 100%;
		background-position: var(--bg-pos);
		transition: all var(--ease) var(--duration);
	}
	#msig-vis > div {
		background: linear-gradient(
			to right,
			var(--color-on-success) 50%,
			var(--color-on-surface-variant) 50%
		);
		background-size: 200% 100%;
		background-position: var(--bg-pos);
		background-clip: text;
		color: transparent;
		transition: all var(--ease) var(--duration);
	}
</style>
