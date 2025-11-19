<script lang="ts">
	import { Asset, type Checksum256 } from '@wharfkit/antelope';
	import { getContext, onMount } from 'svelte';
	import { Card, Button, Stack, Number as NumberFormat } from 'unicove-components';
	import type { UnicoveContext } from '$lib/state/client.svelte';
	import AssetText from '$lib/components/elements/asset.svelte';
	import TopicStats from '$lib/components/sentiment/topicStats.svelte';
	import VoteButtons from '$lib/components/sentiment/voteButtons.svelte';
	import TransactForm from '$lib/components/transact/form.svelte';
	import { formatDescription } from '$lib/utils/strings';
	import StatCard from '$lib/components/sentiment/StatCard.svelte';
	import { ThumbsDown, ThumbsUp, Users } from '@lucide/svelte';

	const context = getContext<UnicoveContext>('state');
	const { data } = $props();

	let transactionError = $state<string | undefined>(undefined);
	let pendingUpdateTimestamp = $state<string | null>(null);

	// Auto-clear loading state when data updates after transaction
	$effect(() => {
		const currentTimestamp = data.sentiment.currentTopic?.topic?.lastUpdated;

		if (pendingUpdateTimestamp && currentTimestamp && currentTimestamp !== pendingUpdateTimestamp) {
			data.sentiment.loadingStatistics = false;
			pendingUpdateTimestamp = null;
		}
	});

	async function handleVoteSuccess(id?: Checksum256, voteType?: number | null) {
		// Update local state optimistically
		if (context.account && voteType !== undefined) {
			data.sentiment.updateUserVote(context.account.name, data.topicId, voteType);
		}

		// Capture timestamp before refresh to detect when new data arrives
		pendingUpdateTimestamp = data.sentiment.currentTopic?.topic?.lastUpdated ?? null;
		data.sentiment.loadingStatistics = true;
	}

	async function handleVoteFailure(error: string) {
		transactionError = error;
	}

	$effect(() => {
		if (context.account?.name) {
			data.sentiment.loadUserVote(context.account.name, data.topicId);
		} else {
			data.sentiment.currentUserVote = null;
		}
	});

	onMount(() => {
		let interval: ReturnType<typeof setInterval> | null = null;

		const startRefresh = () => {
			if (interval) return;
			interval = setInterval(async () => {
				if (document.hidden) return;

				try {
					await data.sentiment.refreshTopicAndVotes(data.topicId, true);
				} catch (e) {
					console.error('Auto-refresh failed:', e);
				}
			}, 5000);
		};

		const stopRefresh = () => {
			if (interval) {
				clearInterval(interval);
				interval = null;
			}
		};

		const handleVisibilityChange = () => {
			if (document.hidden) {
				console.log('Tab hidden - pausing auto-refresh');
			} else {
				console.log('Tab visible - resuming auto-refresh');
				data.sentiment.refreshTopicAndVotes(data.topicId, true).catch((e) => {
					console.error('Failed to refresh on visibility change:', e);
				});
			}
		};

		startRefresh();

		document.addEventListener('visibilitychange', handleVisibilityChange);

		return () => {
			stopRefresh();
			document.removeEventListener('visibilitychange', handleVisibilityChange);
		};
	});
</script>

<svelte:head>
	<title>{data.pageMetaTags.title}</title>
	<meta name="description" content={data.pageMetaTags.description} />
</svelte:head>

{#snippet Failure()}
	<Button onclick={() => (transactionError = undefined)}>Back</Button>
{/snippet}

<article>
	<Stack class="gap-8">
		{#if data.sentiment.refreshing}
			<div
				class="bg-primary/10 text-primary border-primary/30 flex items-center gap-2 rounded border px-4 py-2 text-sm"
			>
				<svg class="size-4 animate-spin" viewBox="0 0 24 24" fill="none">
					<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"
					></circle>
					<path
						class="opacity-75"
						fill="currentColor"
						d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
					></path>
				</svg>
				<span>Updating...</span>
			</div>
		{/if}

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

		{#if data.sentiment.currentTopic}
			{@const topic = data.sentiment.currentTopic.topic}
			{@const statistics = data.sentiment.currentTopic.statistics}
			{@const systemTokenSymbol = context.network.chain.systemToken?.symbol || '4,EOS'}

			<div class="grid grid-cols-3 gap-6">
				<Stack class="col-span-2 gap-3">
					<h2 class="text-on-surface text-headline">Description</h2>
					<Card class="text-on-surface h-full whitespace-pre-wrap">
						{#if topic.description}
							{formatDescription(topic.description)}
						{/if}
					</Card>
				</Stack>

				<Stack class="gap-3">
					<h2 class="text-on-surface text-headline">Your Vote</h2>
					<Card>
						<TransactForm error={transactionError} onfailure={Failure}>
							<VoteButtons
								topicId={data.topicId}
								currentVote={data.sentiment.currentUserVote?.vote_type ?? null}
								onVoteSuccess={handleVoteSuccess}
								onVoteFailure={handleVoteFailure}
							/>
						</TransactForm>
					</Card>
				</Stack>
			</div>

			{#if statistics}
				<Stack class="gap-3">
					<h2 class="text-on-surface text-headline">Statistics</h2>
					<TopicStats {statistics} loading={data.sentiment.loadingStatistics} />
				</Stack>
			{/if}

			{#if data.sentiment.currentVotes.length > 0}
				<Stack class="gap-3">
					<h2 class="text-on-surface text-headline">Participants</h2>

					<Stack>
						<div class="grid gap-6 @lg:grid-cols-3">
							<StatCard label="Supporting" icon={ThumbsUp} supports={true}>
								<NumberFormat number={statistics.supportVotes} />
							</StatCard>

							<StatCard label="Participants" icon={Users}>
								<NumberFormat number={statistics.totalVotes} />
							</StatCard>

							<StatCard label="Opposing" icon={ThumbsDown} supports={false}>
								<NumberFormat number={statistics.oppositionVotes} />
							</StatCard>
						</div>

						<div class="grid grid-cols-2 gap-6">
							<Stack class="gap-3">
								<h3 class="text-title">Supporting</h3>
								<Card>
									<ul class="space-y-2">
										{#each data.sentiment.currentVotes.filter((v) => v.voteType === 1) as vote (vote.voter)}
											<li class="flex items-baseline justify-between">
												<div class="flex items-baseline gap-3">
													<span class="text-label-sm text-success bg-success/10 rounded px-2 py-1">
														Support
													</span>
													<a
														href={context.urlPath(`/account/${vote.voter}`)}
														class="text-primary hover:text-primary-hover font-mono"
													>
														{vote.voter}
													</a>
												</div>

												<AssetText
													class="text-on-surface-variant text-label-sm"
													variant="short"
													value={Asset.fromUnits(vote.weight, systemTokenSymbol)}
												/>
											</li>
										{/each}
									</ul>
								</Card>
							</Stack>

							<Stack class="gap-3">
								<h3 class="text-title">Opposing</h3>
								<Card>
									<ul class="space-y-2">
										{#each data.sentiment.currentVotes.filter((v) => v.voteType === 0) as vote (vote.voter)}
											<li class="flex items-baseline justify-between">
												<div class="flex items-baseline gap-3">
													<span class=" bg-error/10 text-error text-label-sm rounded px-2 py-1">
														Oppose
													</span>
													<a
														href={context.urlPath(`/account/${vote.voter}`)}
														class="text-primary hover:text-primary-hover font-mono"
													>
														{vote.voter}
													</a>
												</div>

												<AssetText
													class="text-on-surface-variant text-label-sm"
													variant="short"
													value={Asset.fromUnits(vote.weight, systemTokenSymbol)}
												/>
											</li>
										{/each}
									</ul>
								</Card>
							</Stack>
						</div>

						{#if data.sentiment.pagination && data.sentiment.pagination.hasMore}
							<div class="mt-4 text-center">
								<Button
									variant="secondary"
									onclick={() =>
										data.sentiment.loadTopicVotes(
											data.topicId,
											data.sentiment.pagination!.page + 1
										)}
								>
									Load More Participants
								</Button>
							</div>
						{/if}
					</Stack>
				</Stack>
			{/if}
		{:else}
			<Card>
				<p class="text-on-surface-variant text-center">Loading topic...</p>
			</Card>
		{/if}
	</Stack>
</article>
