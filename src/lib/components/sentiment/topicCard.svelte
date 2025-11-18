<script lang="ts">
	import { Card } from 'unicove-components';
	import type { TopicWithStats } from '$lib/types/sentiment';
	import { getContext } from 'svelte';
	import type { UnicoveContext } from '$lib/state/client.svelte';
	import AssetText from '$lib/components/elements/asset.svelte';

	interface Props {
		topicData: TopicWithStats;
		class?: string;
	}

	const { topicData, class: className }: Props = $props();
	const context = getContext<UnicoveContext>('state');
	const { urlPath } = context;
</script>

<a href={urlPath(`/topic/${topicData.topic.id}`)} class="block">
	<Card class="hover:bg-surface-container transition-colors {className}">
		<div class="space-y-3">
			<div class="flex items-start justify-between gap-4">
				<div>
					<h3 class="text-on-surface text-lg font-bold">{topicData.topic.id}</h3>
					<p class="text-on-surface-variant mt-0.5 text-xs">
						{new Date(topicData.topic.lastUpdated).toLocaleDateString()}
					</p>
				</div>
				<div class="text-right">
					<div class="text-on-surface text-lg font-bold">
						<AssetText variant="short" value={topicData.statistics.totalWeightAsset} />
					</div>
					<p class="text-on-surface-variant mt-0.5 text-xs">
						{topicData.statistics.totalVotes}
						{topicData.statistics.totalVotes === 1 ? 'vote' : 'votes'}
					</p>
				</div>
			</div>

			{#if topicData.statistics.totalVotes > 0}
				<div class="space-y-2">
					<div class="relative">
						{#if topicData.statistics.supportPercentage > 0 && topicData.statistics.oppositionPercentage > 0}
							<div
								class="absolute -top-3 flex -translate-x-1/2 justify-center text-white"
								style="left: {topicData.statistics.supportPercentage}%"
							>
								<svg class="size-3" viewBox="0 0 12 12" fill="currentColor">
									<path d="M6 12 L0 0 L12 0 Z" />
								</svg>
							</div>
						{/if}
						<div class="bg-surface-container flex h-2 gap-[1px] overflow-hidden rounded-full">
							{#if topicData.statistics.supportPercentage > 0}
								<div
									class="bg-success"
									style="width: {topicData.statistics.supportPercentage}%"
								></div>
							{/if}
							{#if topicData.statistics.oppositionPercentage > 0}
								<div
									class="bg-error"
									style="width: {topicData.statistics.oppositionPercentage}%"
								></div>
							{/if}
						</div>
					</div>

					<div class="text-on-surface-variant flex justify-between text-xs">
						<span class="text-success"> {topicData.statistics.supportPercentage}% Support </span>
						<span class="text-error"> {topicData.statistics.oppositionPercentage}% Oppose </span>
					</div>
				</div>
			{/if}
		</div>
	</Card>
</a>
