<script lang="ts">
	import { getContext } from 'svelte';
	import { Asset } from '@wharfkit/antelope';
	import { Card } from 'unicove-components';
	import type { UnicoveContext } from '$lib/state/client.svelte';
	import AssetText from '$lib/components/elements/asset.svelte';
	import SentimentMeter from '$lib/components/sentiment/SentimentMeter.svelte';
	import VoteButtons from '$lib/components/sentiment/voteButtons.svelte';
	import VpSentimentLens from '$lib/components/vp/VpSentimentLens.svelte';
	import { formatBytes } from '$lib/utils/bytes';
	import { percentString } from '$lib/utils';
	import type { VpLens, VpProposalTopicRow } from '$lib/vp/sentiment';
	import type { ApiResponse, TopicDetailData, TopicStatistics } from '$lib/types/sentiment';

	interface Props {
		row: VpProposalTopicRow;
		question: string;
		currentVote: number | null | undefined;
		onVoted: (voteType: number | null) => void;
		basePath: string;
	}

	const { row, question, currentVote, onVoted, basePath }: Props = $props();
	const context = getContext<UnicoveContext>('state');
	const locale = $derived(context.settings.data.locale);
	const systemSymbol = $derived(context.network.chain.systemToken!.symbol);

	let statistics = $state<TopicStatistics | null>(null);
	let lens = $state<VpLens>('system');

	$effect(() => {
		const controller = new AbortController();
		fetch(context.urlPath(`/api/sentiment/topics/${row.topic}`), { signal: controller.signal })
			.then((response) => response.json())
			.then((result: ApiResponse<TopicDetailData>) => {
				if (result.success && result.data) statistics = result.data.statistics;
			})
			.catch(() => {});
		return () => controller.abort();
	});
</script>

<Card>
	<h3 class="text-title">{question}</h3>

	{#if statistics}
		<div class="mt-4 flex flex-wrap items-end justify-between gap-4">
			<div>
				<span class="text-display text-success">
					{percentString(locale, statistics.supportPercentage / 100, 0)}
				</span>
				<p class="text-muted mt-1 text-sm">
					{#if statistics.totalVotes === 1}
						support from 1 vote
					{:else}
						support from {statistics.totalVotes} votes
					{/if}
				</p>
				<p class="text-muted mt-1 text-sm">
					{#if lens === 'accounts'}
						{statistics.totalVotes} accounts voted
					{:else if lens === 'ram'}
						{formatBytes(statistics.metrics.ram.total)}
					{:else if lens === 'vote'}
						{statistics.metrics.v.total.toLocaleString()} V
					{:else}
						<AssetText
							variant="short"
							value={Asset.fromUnits(statistics.metrics.system.total, systemSymbol)}
						/>
					{/if}
				</p>
			</div>
			<VpSentimentLens selected={lens} onselect={(next) => (lens = next)} />
		</div>

		<div class="mt-4">
			<SentimentMeter id="vp-hero-{row.topic}" {statistics} />
		</div>
	{/if}

	<div class="mt-4">
		<VoteButtons
			type="topic"
			topicId={row.topic}
			{currentVote}
			onVoteSuccess={(_id, voteType) => onVoted(voteType ?? null)}
		/>
	</div>

	{#if context.network.supports('discussion')}
		<div class="border-outline mt-4 border-t pt-3">
			<a
				class="text-primary text-sm font-medium hover:underline"
				href="{basePath}/discussion?target=topic:{row.contract}:{row.topic}"
			>
				Read the discussion
			</a>
		</div>
	{/if}
</Card>
