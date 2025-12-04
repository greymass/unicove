<script lang="ts">
	import { getContext } from 'svelte';
	import { Stack, Card, Button } from 'unicove-components';
	import type { UnicoveContext } from '$lib/state/client.svelte';
	import AccountLink from '$lib/components/elements/account.svelte';
	import TopicCard from '$lib/components/sentiment/topicCard.svelte';
	import Multicard from '$lib/components/layout/page/multicard.svelte';
	import { Vote, Shield } from '@lucide/svelte';
	import type { PageData } from './$types';

	interface Props {
		data: PageData;
	}

	const { data }: Props = $props();
	const context = getContext<UnicoveContext>('state');
	const { urlPath, network, producers } = context;

	const top5Producers = $derived(producers.top21.slice(0, 5));
	const topTopics = $derived(data.sentimentState.topics.slice(0, 3));
</script>

<Stack class="gap-16">
	<Multicard>
		{#snippet leftColumn()}
			<Stack class="max-w-md items-start">
				<div class="flex items-center gap-3">
					<Shield class="text-primary size-8" />
					<h2 class="text-title leading-tight">Block Producers</h2>
				</div>
				<p>
					Vote for the validators that secure the {network.chain.name} network. Your voting power is
					weighted by your staked tokens, giving more influence to those with a larger stake in the network's
					security.
				</p>
				<p class="text-on-surface-variant text-sm">
					{#if producers.loading}
						<span class="bg-surface-container inline-block w-32 animate-pulse rounded">&nbsp;</span>
					{:else}
						{producers.statistics.totalActive} active producers
					{/if}
				</p>
				<Button variant="primary" href={urlPath('/producers')}>View All Producers</Button>
			</Stack>
		{/snippet}
		{#snippet rightColumn()}
			{#each [0, 1, 2, 3, 4] as i}
				{@const producer = top5Producers[i]}
				{@const isLoading = producers.loading || !producer}
				{#if isLoading}
					<Card>
						<div class="flex items-center justify-between gap-4">
							<div class="flex items-center gap-3">
								<span class="text-on-surface-variant text-label-sm w-6 text-right">
									#{i + 1}
								</span>
								<span class="bg-surface-container inline-block w-24 animate-pulse rounded"
									>&nbsp;</span
								>
							</div>
							<span
								class="bg-surface-container inline-block w-12 animate-pulse rounded-full px-2 py-0.5 text-xs"
								>&nbsp;</span
							>
						</div>
					</Card>
				{:else}
					<a href={urlPath(`/account/${producer.owner}`)} class="block">
						<Card class="hover:bg-surface-container transition-colors">
							<div class="flex items-center justify-between gap-4">
								<div class="flex items-center gap-3">
									<span class="text-on-surface-variant text-label-sm w-6 text-right">
										#{i + 1}
									</span>
									<AccountLink name={producer.owner} />
								</div>
								{#if i < 21}
									<span class="bg-primary/10 text-primary rounded-full px-2 py-0.5 text-xs">
										Top 21
									</span>
								{/if}
							</div>
						</Card>
					</a>
				{/if}
			{/each}
		{/snippet}
	</Multicard>

	{#if network.supports('sentiment') && topTopics.length > 0}
		<Multicard>
			{#snippet leftColumn()}
				<Stack class="max-w-md items-start">
					<div class="flex items-center gap-3">
						<Vote class="text-primary size-8" />
						<h2 class="text-title leading-tight">Sentiment Voting</h2>
					</div>
					<p>
						Express your support or opposition on key network topics. Your vote is weighted by your
						staked tokens, helping the community gauge consensus on important issues.
					</p>
					<p class="text-on-surface-variant text-sm">
						{data.sentimentState.topics.length} active topics
					</p>
					<Button variant="primary" href={urlPath('/topics')}>View All Topics</Button>
				</Stack>
			{/snippet}
			{#snippet rightColumn()}
				{#each topTopics as topic}
					<TopicCard topicData={topic} />
				{/each}
			{/snippet}
		</Multicard>
	{/if}
</Stack>
