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
	import { formatNumber } from '$lib/utils/intl';
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

	const lensStats = $derived.by(() => {
		if (!statistics) return null;
		if (lens === 'accounts') {
			const total = statistics.totalVotes;
			if (!total) return { supportPercentage: 0, oppositionPercentage: 0 };
			return {
				supportPercentage: (statistics.supportVotes / total) * 100,
				oppositionPercentage: (statistics.oppositionVotes / total) * 100
			};
		}
		const metric = statistics.metrics[lens === 'vote' ? 'v' : lens];
		return {
			supportPercentage: metric.supportPercentage,
			oppositionPercentage: metric.oppositionPercentage
		};
	});

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
	<h2 class="text-title">{question}</h2>

	{#if statistics && lensStats}
		<div class="mt-4 flex flex-wrap items-end justify-between gap-4">
			<div>
				<span class="text-display text-success">
					{percentString(locale, lensStats.supportPercentage / 100, 0)}
				</span>
				<p class="text-muted mt-1 text-sm">
					{#if lens === 'accounts'}
						support by account
					{:else if lens === 'ram'}
						support by RAM weight
					{:else if lens === 'vote'}
						support by V weight
					{:else}
						support by {systemSymbol.name} weight
					{/if}
					·
					{#if statistics.totalVotes === 1}
						1 vote
					{:else}
						{statistics.totalVotes} votes
					{/if}
				</p>
				{#if lens !== 'accounts'}
					<p class="text-muted mt-1 text-sm">
						{#if lens === 'ram'}
							{formatBytes(statistics.metrics.ram.total)}
						{:else if lens === 'vote'}
							{formatNumber(statistics.metrics.v.total, locale, {
								notation: 'compact',
								maximumFractionDigits: 2
							})} V
						{:else}
							<AssetText
								variant="short"
								value={Asset.fromUnits(statistics.metrics.system.total, systemSymbol)}
							/>
						{/if}
					</p>
				{/if}
			</div>
			<VpSentimentLens selected={lens} onselect={(next) => (lens = next)} />
		</div>

		<div class="mt-4">
			<SentimentMeter id="vp-hero-{row.topic}" statistics={lensStats} />
		</div>
	{:else}
		<div class="mt-4 grid animate-pulse gap-3" role="status" aria-busy="true">
			<span class="sr-only">Loading sentiment</span>
			<div class="bg-surface-container h-10 w-32 rounded"></div>
			<div class="bg-surface-container h-7 rounded"></div>
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
