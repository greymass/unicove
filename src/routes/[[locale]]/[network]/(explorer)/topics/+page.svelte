<script lang="ts">
	import { getContext } from 'svelte';
	import { Button, Card, Stack } from 'unicove-components';
	import TopicCard from '$lib/components/sentiment/topicCard.svelte';
	import type { UnicoveContext } from '$lib/state/client.svelte';

	const { data } = $props();
	const context = getContext<UnicoveContext>('state');

	const sortedTopics = $derived(
		[...data.sentiment.topics].sort((a, b) => b.statistics.totalWeight - a.statistics.totalWeight)
	);
</script>

<svelte:head>
	<title>{data.pageMetaTags.title}</title>
	<meta name="description" content={data.pageMetaTags.description} />
</svelte:head>

<div class="xs:grid-cols-full grid gap-6 lg:grid-cols-[70%_1fr]">
	<div class="space-y-6">
		{#if data.sentiment.loading}
			<div class="py-12 text-center">
				<p class="text-on-surface-variant">Loading topics...</p>
			</div>
		{:else if data.sentiment.error}
			<div class="bg-error-container rounded p-6 text-center">
				<p class="text-on-error-container font-semibold">Failed to load topics</p>
				<p class="text-on-error-container mt-2 text-sm">
					{data.sentiment.error}
				</p>
				<Button class="mt-4" variant="secondary" onclick={() => data.sentiment.loadTopics()}>
					Try Again
				</Button>
			</div>
		{:else if data.sentiment.topics.length === 0}
			<div class="py-12 text-center">
				<p class="text-on-surface-variant text-lg">No topics available yet</p>
			</div>
		{:else}
			<div class="space-y-4">
				{#each sortedTopics as topicData}
					<TopicCard {topicData} />
				{/each}
			</div>

			{#if data.sentiment.pagination?.hasMore}
				<div class="flex justify-center pt-4">
					<Button
						variant="secondary"
						onclick={() => data.sentiment.loadMore()}
						disabled={data.sentiment.loadingMore}
					>
						{data.sentiment.loadingMore ? 'Loading...' : 'Load More'}
					</Button>
				</div>
			{/if}
		{/if}
	</div>
	<div class="space-y-6">
		<Card title="About Sentiment Voting">
			<Stack>
				<div class="space-y-3 text-sm">
					<p>
						Sentiment voting allows token holders to express their support or opposition on
						important community topics. Your vote is weighted by your staked tokens, giving more
						influence to those with a larger stake in the network.
					</p>
					<p>
						Each topic shows the total participation and the distribution of support versus
						opposition, helping the community gauge consensus on key issues.
					</p>
				</div>
				<Button href={context.urlPath('/staking')} variant="secondary">Staking</Button>
			</Stack>
		</Card>
	</div>
</div>
