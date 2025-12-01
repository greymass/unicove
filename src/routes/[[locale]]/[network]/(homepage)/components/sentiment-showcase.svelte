<script lang="ts">
	import { Card, Button, Stack } from 'unicove-components';
	import SentimentMeter from '$lib/components/sentiment/SentimentMeter.svelte';
	import AssetText from '$lib/components/elements/asset.svelte';
	import type { TopicWithStats } from '$lib/types/sentiment';
	import { getContext } from 'svelte';
	import type { UnicoveContext } from '$lib/state/client.svelte';

	interface Props {
		topics?: TopicWithStats[];
	}

	let { topics = [] }: Props = $props();
	const { urlPath } = getContext<UnicoveContext>('state');

	const displayTopics = $derived(topics.slice(0, 3));
</script>

<section class="@container grid grid-cols-2 items-start gap-x-4 gap-y-8">
	<div
		class="col-span-full row-start-1 grid items-center text-balance @3xl:col-span-1 @3xl:row-start-1"
	>
		<Stack class="max-w-md items-start">
			<h2 class="text-title leading-tight">Sentiment Voting</h2>
			<p>
				An experimental governance system being developed during Vaulta's transition period. Express
				your support or opposition on key network topics, with voting power weighted by your staked
				tokens.
			</p>
			<p>
				Topic creation is not yet available. Currently, only voting on existing proposals is
				supported.
			</p>
		</Stack>
	</div>

	<div class="col-span-full row-start-2 grid content-start gap-4 @3xl:col-start-2 @3xl:row-start-1">
		{#each displayTopics as topic}
			<a href={urlPath(`/topics/${topic.topic.id}`)} class="block">
				<Card class="hover:bg-surface-container transition-colors">
					<div class="space-y-3">
						<div class="flex items-start justify-between gap-4">
							<h4 class="text-on-surface text-label line-clamp-1 font-semibold">
								{topic.topic.id}
							</h4>
							<div class="flex flex-col items-end gap-1">
								<span class="text-on-surface text-label-sm whitespace-nowrap">
									<AssetText variant="short" value={topic.statistics.totalWeightAsset} />
								</span>
								<span class="text-on-surface-variant text-label-sm whitespace-nowrap">
									{topic.statistics.totalVotes}
									{topic.statistics.totalVotes === 1 ? 'vote' : 'votes'}
								</span>
							</div>
						</div>

						{#if topic.statistics.totalVotes > 0}
							<SentimentMeter id={`homepage-${topic.topic.id}`} statistics={topic.statistics} />
						{/if}
					</div>
				</Card>
			</a>
		{/each}
	</div>

	<div class="col-span-full row-start-3 @3xl:col-span-1 @3xl:row-start-2">
		<Button variant="primary" href={urlPath('/topics')}>View All Topics</Button>
	</div>
</section>
