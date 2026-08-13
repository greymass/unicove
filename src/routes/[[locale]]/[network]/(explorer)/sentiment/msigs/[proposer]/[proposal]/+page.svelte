<script lang="ts">
	import { getContext, onMount } from 'svelte';
	import { Button, Card, Stack } from 'unicove-components';
	import type { UnicoveContext } from '$lib/state/client.svelte';
	import VoteButtons from '$lib/components/sentiment/voteButtons.svelte';
	import MetricOverviewCard from '$lib/components/sentiment/MetricOverviewCard.svelte';
	import MetricLensDetail from '$lib/components/sentiment/MetricLensDetail.svelte';
	import MetricParticipants from '$lib/components/sentiment/MetricParticipants.svelte';
	import type { MetricLens } from '$lib/types/sentiment';

	const context = getContext<UnicoveContext>('state');
	const { data } = $props();

	let activeLens = $state<MetricLens>('system');
	const systemSymbol = $derived(context.network.chain.systemToken!.symbol);
	const lensLabels: Record<MetricLens, string> = $derived({
		system: String(systemSymbol.name),
		ram: 'RAM',
		v: 'V'
	});

	let userVote = $derived(data.sentiment.currentUserVote?.vote_type ?? null);

	function selectLens(lens: MetricLens) {
		activeLens = lens;
		data.sentiment.loadMsigVotes(data.proposer, data.proposal, 1, 50, lens);
	}

	onMount(() => {
		if (context.account) {
			data.sentiment.loadUserVote(context.account.name, data.proposer, data.proposal);
		}
	});

	async function handleVoteSuccess() {
		await data.sentiment.refreshMsigAndVotes(
			data.proposer,
			data.proposal,
			false,
			context.account?.name,
			true,
			activeLens
		);
	}
</script>

<article class="@container">
	<Stack class="gap-8">
		{#if data.sentiment.error}
			<div
				class="bg-error/10 text-error border-error/30 flex items-center justify-between gap-2 rounded border px-4 py-2 text-sm"
			>
				<span>{data.sentiment.error}</span>
				<Button variant="text" onclick={() => (data.sentiment.error = null)} class="text-error">
					Dismiss
				</Button>
			</div>
		{/if}

		{#if data.sentiment.currentMsig}
			{@const statistics = data.sentiment.currentMsig.statistics}

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
						proposer={data.proposer}
						proposalName={data.proposal}
						currentVote={userVote}
						onVoteSuccess={handleVoteSuccess}
					/>
				</Card>
			</Stack>

			{#if data.sentiment.currentVotes.length > 0}
				<MetricParticipants
					votes={data.sentiment.currentVotes}
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
