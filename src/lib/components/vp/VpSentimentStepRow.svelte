<script lang="ts">
	import { getContext } from 'svelte';
	import { Card, Chip } from 'unicove-components';
	import type { UnicoveContext } from '$lib/state/client.svelte';
	import SentimentMeter from '$lib/components/sentiment/SentimentMeter.svelte';
	import VoteButtons from '$lib/components/sentiment/voteButtons.svelte';
	import { percentString } from '$lib/utils';
	import type { VpMsigPollRow } from '$lib/vp/sentiment';
	import type { ApiResponse, MsigDetailData, TopicStatistics } from '$lib/types/sentiment';

	interface Props {
		row: VpMsigPollRow;
		question: string;
		currentVote: number | null | undefined;
		onVoted: (voteType: number | null) => void;
	}

	const { row, question, currentVote, onVoted }: Props = $props();
	const context = getContext<UnicoveContext>('state');
	const locale = $derived(context.settings.data.locale);

	let statistics = $state<TopicStatistics | null>(null);
	let loaded = $state(false);

	$effect(() => {
		const controller = new AbortController();
		fetch(context.urlPath(`/api/sentiment/msigs/${row.proposer}/${row.proposal}`), {
			signal: controller.signal
		})
			.then((response) => response.json())
			.then((result: ApiResponse<MsigDetailData>) => {
				if (result.success && result.data) statistics = result.data.statistics;
				loaded = true;
			})
			.catch(() => {
				loaded = true;
			});
		return () => controller.abort();
	});
</script>

<Card class={row.votable ? 'ring-primary ring-1' : 'opacity-60'}>
	<div class="flex items-start justify-between gap-3">
		<div class="flex min-w-0 items-start gap-3">
			<span
				class="text-muted bg-surface-container-high grid size-7 shrink-0 place-items-center rounded-full text-xs font-semibold"
			>
				{row.step}
			</span>
			<div class="min-w-0">
				<h4 class="font-medium">{question}</h4>
				<p class="text-muted mt-1 font-mono text-sm">{row.proposer}/{row.proposal}</p>
			</div>
		</div>
		{#if !row.votable}
			<Chip class="shrink-0 whitespace-nowrap">Closed</Chip>
		{/if}
	</div>

	{#if statistics && statistics.totalVotes > 0}
		<div class="mt-3 flex items-center gap-4">
			<div class="flex-1">
				<SentimentMeter id="vp-step-{row.proposer}-{row.proposal}" compact {statistics} />
			</div>
			<span class="text-muted shrink-0 text-sm">
				{#if statistics.totalVotes === 1}
					{percentString(locale, statistics.supportPercentage / 100, 0)} of 1 vote
				{:else}
					{percentString(locale, statistics.supportPercentage / 100, 0)} of {statistics.totalVotes}
					votes
				{/if}
			</span>
		</div>
	{:else if loaded}
		<p
			class="border-outline text-muted mt-3 rounded-lg border border-dashed p-3 text-center text-sm"
		>
			No votes were recorded on this step.
		</p>
	{/if}

	{#if row.votable}
		<div class="mt-3">
			<VoteButtons
				type="msig"
				proposer={row.proposer}
				proposalName={row.proposal}
				{currentVote}
				onVoteSuccess={(_id, voteType) => onVoted(voteType ?? null)}
			/>
		</div>
	{/if}

	<a
		class="text-primary border-outline mt-4 block border-t pt-3 text-sm font-medium"
		href={context.urlPath(`${row.msigPath}/sentiment`)}
	>
		View full results
	</a>
</Card>
