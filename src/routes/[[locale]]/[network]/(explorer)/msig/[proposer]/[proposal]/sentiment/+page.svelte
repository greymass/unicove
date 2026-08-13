<script lang="ts">
	import { getContext, onMount } from 'svelte';
	import { Button, Card, Stack } from 'unicove-components';
	import type { UnicoveContext } from '$lib/state/client.svelte';
	import VoteButtons from '$lib/components/sentiment/voteButtons.svelte';
	import MetricOverviewCard from '$lib/components/sentiment/MetricOverviewCard.svelte';
	import MetricLensDetail from '$lib/components/sentiment/MetricLensDetail.svelte';
	import MetricParticipants from '$lib/components/sentiment/MetricParticipants.svelte';
	import { MsigSentimentState } from '$lib/state/sentiment/msig.svelte';
	import type { MetricLens } from '$lib/types/sentiment';

	const context = getContext<UnicoveContext>('state');
	const { data } = $props();

	const sentimentState = $state(new MsigSentimentState(context.network, data.locale));

	let activeLens = $state<MetricLens>('system');
	const systemSymbol = $derived(context.network.chain.systemToken!.symbol);
	const lensLabels: Record<MetricLens, string> = $derived({
		system: String(systemSymbol.name),
		ram: 'RAM',
		v: 'V'
	});

	let userVote = $derived(sentimentState.currentUserVote?.vote_type ?? null);

	function selectLens(lens: MetricLens) {
		activeLens = lens;
		sentimentState.loadMsigVotes(data.proposal.proposer, data.proposal.name, 1, 50, lens);
	}

	onMount(() => {
		sentimentState.loadMsig(data.proposal.proposer, data.proposal.name);
		sentimentState.loadMsigVotes(data.proposal.proposer, data.proposal.name, 1, 50, activeLens);
		if (context.account) {
			sentimentState.loadUserVote(context.account.name, data.proposal.proposer, data.proposal.name);
		}
	});

	async function handleVoteSuccess() {
		await sentimentState.refreshMsigAndVotes(
			data.proposal.proposer,
			data.proposal.name,
			false,
			context.account?.name,
			true,
			activeLens
		);
	}
</script>

<article class="@container">
	<Stack class="gap-8">
		{#if sentimentState.error}
			<div
				class="bg-error/10 text-error border-error/30 flex items-center justify-between gap-2 rounded border px-4 py-2 text-sm"
			>
				<span>{sentimentState.error}</span>
				<Button variant="text" onclick={() => (sentimentState.error = null)} class="text-error">
					Dismiss
				</Button>
			</div>
		{/if}

		{#if sentimentState.currentMsig}
			{@const statistics = sentimentState.currentMsig.statistics}

			<Stack class="gap-3">
				<h2 class="text-on-surface text-headline">Statistics</h2>
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
				<MetricLensDetail lens={activeLens} stats={statistics.metrics[activeLens]} {systemSymbol} />
			</Stack>

			<Stack class="gap-3">
				<h2 class="text-on-surface text-headline">Your Vote</h2>
				<Card>
					<VoteButtons
						type="msig"
						proposer={data.proposal.proposer}
						proposalName={data.proposal.name}
						currentVote={userVote}
						onVoteSuccess={handleVoteSuccess}
					/>
				</Card>
			</Stack>

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
		{:else}
			<Card>
				<p class="text-on-surface-variant text-center">Loading sentiment...</p>
			</Card>
		{/if}
	</Stack>
</article>
