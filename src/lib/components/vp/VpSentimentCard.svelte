<script lang="ts">
	import { getContext } from 'svelte';
	import { Card } from 'unicove-components';
	import { Asset } from '@wharfkit/antelope';
	import type { UnicoveContext } from '$lib/state/client.svelte';
	import SentimentMeter from '$lib/components/sentiment/SentimentMeter.svelte';
	import AssetText from '$lib/components/elements/asset.svelte';
	import type { ApiResponse, TopicDetailData, TopicStatistics } from '$lib/types/sentiment';
	import { sentimentTopicPath } from '$lib/vp/onchain';

	interface Props {
		contract: string;
		topic: string;
	}

	const { contract, topic }: Props = $props();
	const context = getContext<UnicoveContext>('state');

	const enabled = $derived(context.network.supports('sentiment'));
	const topicHref = $derived(context.urlPath(sentimentTopicPath({ contract, topic })));
	const systemSymbol = $derived(context.network.chain.systemToken?.symbol || '4,EOS');

	let statistics = $state<TopicStatistics | null>(null);

	$effect(() => {
		if (!enabled) {
			return;
		}
		const controller = new AbortController();
		fetch(context.urlPath(`/api/sentiment/topics/${topic}`), { signal: controller.signal })
			.then((response) => response.json())
			.then((result: ApiResponse<TopicDetailData>) => {
				if (result.success && result.data) {
					statistics = {
						...result.data.statistics,
						supportPercentage: Math.round(result.data.statistics.supportPercentage),
						oppositionPercentage: Math.round(result.data.statistics.oppositionPercentage)
					};
				}
			})
			.catch(() => {});
		return () => controller.abort();
	});
</script>

<Card>
	<div class="flex flex-wrap items-center justify-between gap-2">
		<a class="text-primary font-medium hover:underline" href={topicHref}>{topic}</a>
		<span class="text-muted text-sm">{contract}</span>
	</div>
	{#if statistics}
		<SentimentMeter id="vp-sentiment-{topic}" {statistics} />
		<div class="text-muted text-sm">
			{statistics.totalVotes} votes · <AssetText
				variant="short"
				value={Asset.fromUnits(statistics.totalWeight, systemSymbol)}
			/> participating
		</div>
	{:else}
		<div class="text-muted text-sm">Sentiment for this topic is recorded on-chain.</div>
	{/if}
</Card>
