<script lang="ts">
	import { getContext, onMount } from 'svelte';

	import { Button, Card, Chip, cn } from 'unicove-components';
	import { DD, DL, DLRow } from 'unicove-components';
	import { Stack, Switcher } from 'unicove-components';
	import type { UnicoveContext } from '$lib/state/client.svelte.js';
	import Account from '$lib/components/elements/account.svelte';
	import TransactForm from '$lib/components/transact/form.svelte';
	import VoteButtons from '$lib/components/sentiment/voteButtons.svelte';
	import MetricOverviewCard from '$lib/components/sentiment/MetricOverviewCard.svelte';
	import MetricLensDetail from '$lib/components/sentiment/MetricLensDetail.svelte';
	import MetricParticipants from '$lib/components/sentiment/MetricParticipants.svelte';
	import { MsigSentimentState } from '$lib/state/sentiment/msig.svelte';
	import type { MetricLens } from '$lib/types/sentiment';

	import { ApprovalManager } from './manager.svelte';
	import { goto, invalidateAll } from '$app/navigation';

	let { data } = $props();

	let context = getContext<UnicoveContext>('state');

	const manager = $state(new ApprovalManager(context, data.proposal));
	$effect(() => {
		manager.sync(data.network, context.wharf);
	});

	const sentimentState = $state(new MsigSentimentState(context.network, data.locale));
	let userVote = $derived(sentimentState.currentUserVote?.vote_type ?? null);

	let activeLens = $state<MetricLens>('system');
	const systemSymbol = $derived(context.network.chain.systemToken!.symbol);
	const lensLabels: Record<MetricLens, string> = $derived({
		system: String(systemSymbol.name),
		ram: 'RAM',
		v: 'V'
	});

	function selectLens(lens: MetricLens) {
		activeLens = lens;
		sentimentState.loadMsigVotes(data.proposal.proposer, data.proposal.name, 1, 50, lens);
	}

	onMount(() => {
		let interval: ReturnType<typeof setInterval> | undefined;
		if (manager.isActive) {
			interval = setInterval(() => {
				invalidateAll();
			}, 15000);
		}

		if (context.network.supports('sentiment')) {
			sentimentState.loadMsig(data.proposal.proposer, data.proposal.name);
			sentimentState.loadMsigVotes(data.proposal.proposer, data.proposal.name, 1, 50, activeLens);
			if (context.account) {
				sentimentState.loadUserVote(
					context.account.name,
					data.proposal.proposer,
					data.proposal.name
				);
			}
		}

		return () => {
			if (interval) clearInterval(interval);
		};
	});

	const top21 = data.producers.slice(0, 21);

	const statusColors: Record<string, string> = {
		proposed: 'bg-primary text-on-primary',
		executed: 'bg-success text-on-success',
		cancelled: 'bg-surface-container-high text-on-surface-variant',
		expired: 'bg-error text-on-error'
	};

	const statusColor = $derived(statusColors[data.proposal.status] || statusColors.proposed);

	async function cancel() {
		await manager.cancel();
		goto(`/${data.network}/account/${data.proposal.proposer}/proposals`, {
			invalidateAll: true
		});
	}

	async function handleVoteSuccess() {
		if (context.account) {
			await sentimentState.refreshMsigAndVotes(
				data.proposal.proposer,
				data.proposal.name,
				false,
				context.account.name,
				true,
				activeLens
			);
		}
	}
</script>

{#snippet Complete()}
	<div class="flex gap-4">
		<Button onclick={() => manager.reset()}>Back</Button>
	</div>
{/snippet}

<Stack>
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

		<Stack class="gap-4">
			<h2 class="text-title">Multisig Details</h2>

			<Card class="@container pt-3">
				<TransactForm
					id={manager.result?.resolved?.transaction.id}
					error={manager.error}
					onsuccess={Complete}
					onfailure={Complete}
				>
					<Stack class="gap-4" id="details">
						<DL>
							<DLRow title="Status">
								<DD>
									<Chip class={cn('capitalize', statusColor)}>{data.proposal.status}</Chip>
								</DD>
							</DLRow>
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
							{#if data.proposal.status === 'executed' && data.proposal.executed_by}
								<DLRow title="Executed By">
									<DD>
										<Account name={data.proposal.executed_by} />
									</DD>
								</DLRow>
							{/if}
							{#if data.proposal.status === 'executed' && data.proposal.executed_at}
								<DLRow title="Executed At">
									<DD>
										{data.proposal.executed_at}
									</DD>
								</DLRow>
							{/if}
						</DL>

						{#if manager.isActive}
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
						{/if}
					</Stack>
				</TransactForm>
			</Card>

			{#if context.network.supports('sentiment') && sentimentState.currentMsig}
				{@const statistics = sentimentState.currentMsig.statistics}
				<h2 class="text-title">Community Sentiment</h2>
				<Card class="@container">
					<Stack class="gap-6">
						<div class="grid gap-6 @xl:grid-cols-3">
							{#each Object.keys(lensLabels) as lens (lens)}
								{@const key = lens as MetricLens}
								<MetricOverviewCard
									lens={key}
									label={lensLabels[key]}
									stats={statistics.metrics[key]}
									selected={activeLens === key}
									onselect={selectLens}
								/>
							{/each}
						</div>
						<MetricLensDetail
							lens={activeLens}
							stats={statistics.metrics[activeLens]}
							{systemSymbol}
						/>

						<VoteButtons
							type="msig"
							proposer={data.proposal.proposer}
							proposalName={data.proposal.name}
							currentVote={userVote}
							onVoteSuccess={handleVoteSuccess}
						/>
					</Stack>
				</Card>

				{#if sentimentState.currentVotes.length > 0}
					<MetricParticipants
						votes={sentimentState.currentVotes}
						lens={activeLens}
						totalVotes={statistics.totalVotes}
						supportVotes={statistics.supportVotes}
						oppositionVotes={statistics.oppositionVotes}
						{systemSymbol}
					/>
				{/if}
			{/if}
		</Stack>
	</Switcher>
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
