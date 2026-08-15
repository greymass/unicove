<script lang="ts">
	import { getContext } from 'svelte';
	import { Card } from 'unicove-components';
	import type { UnicoveContext } from '$lib/state/client.svelte';
	import SentimentMeter from '$lib/components/sentiment/SentimentMeter.svelte';
	import { percentString } from '$lib/utils';
	import type { TopicStatistics, ApiResponse, TopicDetailData } from '$lib/types/sentiment';
	import type { VpSummary } from '$lib/vp/types';

	interface Props {
		summary: VpSummary;
		basePath: string;
	}

	const { summary, basePath }: Props = $props();
	const context = getContext<UnicoveContext>('state');

	const locale = $derived(context.settings.data.locale);
	const topic = $derived(summary.sentiment[0] ?? null);
	let statistics = $state<TopicStatistics | null>(null);

	$effect(() => {
		if (!topic) return;
		const controller = new AbortController();
		fetch(context.urlPath(`/api/sentiment/topics/${topic.topic}`), { signal: controller.signal })
			.then((response) => response.json())
			.then((result: ApiResponse<TopicDetailData>) => {
				if (result.success && result.data) statistics = result.data.statistics;
			})
			.catch(() => {});
		return () => controller.abort();
	});
</script>

<Card class="hover:bg-surface-container-high p-0 transition-colors">
	<a href="{basePath}/sentiment" class="block p-4">
		<div class="flex items-baseline justify-between gap-2">
			<h2 class="text-title">Sentiment</h2>
			{#if statistics}
				<span class="text-muted text-label-sm">
					{#if statistics.totalVotes === 1}
						1 vote
					{:else}
						{statistics.totalVotes} votes
					{/if}
				</span>
			{/if}
		</div>

		{#if statistics}
			<div class="mt-3 flex items-end justify-between gap-3">
				<div>
					<span class="text-headline text-success">
						{percentString(locale, statistics.supportPercentage / 100, 0)}
					</span>
					<p class="text-muted text-sm">support</p>
				</div>
				<div class="text-right">
					<span class="text-title text-error">
						{percentString(locale, statistics.oppositionPercentage / 100, 0)}
					</span>
					<p class="text-muted text-sm">oppose</p>
				</div>
			</div>
			<div class="mt-3">
				<SentimentMeter id="vp-card-{topic?.topic}" compact {statistics} />
			</div>
		{:else}
			<p class="text-muted mt-3 text-sm">Sentiment is recorded on-chain.</p>
		{/if}

		<p class="text-primary border-outline mt-4 border-t pt-3 text-sm font-medium">View sentiment</p>
	</a>
</Card>
