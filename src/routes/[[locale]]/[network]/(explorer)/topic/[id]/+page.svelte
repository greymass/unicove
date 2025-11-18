<script lang="ts">
	import { Asset, type Checksum256 } from '@wharfkit/antelope';
	import { getContext, onMount } from 'svelte';
	import { Card, Button } from 'unicove-components';
	import type { UnicoveContext } from '$lib/state/client.svelte';
	import AssetText from '$lib/components/elements/asset.svelte';
	import TopicStats from '$lib/components/sentiment/topicStats.svelte';
	import VoteButtons from '$lib/components/sentiment/voteButtons.svelte';
	import TransactForm from '$lib/components/transact/form.svelte';

	const context = getContext<UnicoveContext>('state');
	const { data } = $props();

	let transactionId = $state<Checksum256 | undefined>(undefined);
	let transactionError = $state<string | undefined>(undefined);
	let lastUpdatedBeforeAction = $state<string | null>(null);

	$effect(() => {
		if (lastUpdatedBeforeAction && data.sentiment.currentTopic?.topic?.lastUpdated) {
			if (data.sentiment.currentTopic.topic.lastUpdated !== lastUpdatedBeforeAction) {
				data.sentiment.loadingStatistics = false;
				lastUpdatedBeforeAction = null;
			}
		}
	});

	async function handleVoteSuccess(id?: Checksum256, voteType?: number | null) {
		if (context.account && voteType !== undefined) {
			data.sentiment.updateUserVote(context.account.name, data.topicId, voteType);
		}

		if (data.sentiment.currentTopic?.topic?.lastUpdated) {
			lastUpdatedBeforeAction = data.sentiment.currentTopic.topic.lastUpdated;
		}

		data.sentiment.loadingStatistics = true;

		transactionId = id;
	}

	async function handleVoteFailure(error: string) {
		transactionError = error;
	}

	let lastRefreshSuccess = $state(true);

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
					lastRefreshSuccess = true;
				} catch (e) {
					console.error('Auto-refresh failed:', e);
					lastRefreshSuccess = false;
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

<div class="mx-auto w-full max-w-4xl space-y-6">
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

		<Card>
			<div class="space-y-4">
				<div>
					<h2 class="text-on-surface text-2xl font-bold">{topic.id}</h2>
					<p class="text-on-surface-variant mt-1 text-sm">
						Last updated {new Date(topic.lastUpdated).toLocaleString()}
					</p>
				</div>

				{#if topic.description}
					<div class="bg-surface-container space-y-1 rounded-lg p-4">
						<div class="text-on-surface-variant text-xs font-medium tracking-wide uppercase">
							Description
						</div>
						<p class="text-on-surface">{topic.description}</p>
					</div>
				{/if}
			</div>
		</Card>

		<div>
			<h2 class="text-on-surface mb-3 text-xl font-bold">Cast Your Vote</h2>
			<Card>
				<TransactForm
					id={transactionId}
					error={transactionError}
					onfailure={Failure}
					onsuccessdismiss={() => (transactionId = undefined)}
				>
					<div class="space-y-4">
						{#if data.sentiment.currentUserVote}
							<div
								class="{data.sentiment.currentUserVote.vote_type === 1
									? 'bg-success/20 text-success border-success/30 border'
									: 'bg-error/20 text-error border-error/30 border'} flex items-center justify-between gap-3 rounded p-3 text-sm"
							>
								<div>
									You are <strong
										>{data.sentiment.currentUserVote.vote_type === 1
											? 'Supporting'
											: 'Opposing'}</strong
									> this topic
								</div>
								<VoteButtons
									topicId={data.topicId}
									currentVote={data.sentiment.currentUserVote.vote_type}
									onVoteSuccess={handleVoteSuccess}
									onVoteFailure={handleVoteFailure}
									showOnlyRemove={true}
								/>
							</div>
						{/if}

						<VoteButtons
							topicId={data.topicId}
							currentVote={data.sentiment.currentUserVote?.vote_type ?? null}
							onVoteSuccess={handleVoteSuccess}
							onVoteFailure={handleVoteFailure}
						/>
					</div>
				</TransactForm>
			</Card>
		</div>

		{#if statistics}
			<div>
				<h2 class="text-on-surface mb-3 text-xl font-bold">Vote Statistics</h2>
				<TopicStats {statistics} loading={data.sentiment.loadingStatistics} />
			</div>
		{/if}

		{#if data.sentiment.currentVotes.length > 0}
			<div>
				<h2 class="text-on-surface mb-3 text-xl font-bold">Participants</h2>
				<Card>
					<div class="space-y-2">
						{#each data.sentiment.currentVotes as vote (vote.voter)}
							<div class="flex items-center justify-between py-2">
								<div class="flex items-center gap-3">
									<span
										class="inline-flex items-center rounded px-2 py-1 text-xs font-semibold {vote.voteType ===
										1
											? 'bg-success/10 text-success'
											: 'bg-error/10 text-error'}"
									>
										{vote.voteType === 1 ? 'Support' : 'Oppose'}
									</span>
									<a
										href={context.urlPath(`/account/${vote.voter}`)}
										class="text-primary hover:text-primary-hover font-mono"
									>
										{vote.voter}
									</a>
								</div>
								<span class="text-on-surface-variant text-sm">
									<AssetText
										variant="short"
										value={Asset.fromUnits(vote.weight, systemTokenSymbol)}
									/>
								</span>
							</div>
						{/each}
					</div>

					{#if data.sentiment.pagination && data.sentiment.pagination.hasMore}
						<div class="mt-4 text-center">
							<Button
								variant="secondary"
								onclick={() =>
									data.sentiment.loadTopicVotes(data.topicId, data.sentiment.pagination!.page + 1)}
							>
								Load More Participants
							</Button>
						</div>
					{/if}
				</Card>
			</div>
		{/if}

		<div class="text-center">
			<Button href={context.urlPath('/topics')} variant="secondary">Back to All Topics</Button>
		</div>
	{:else}
		<Card>
			<p class="text-on-surface-variant text-center">Loading topic...</p>
		</Card>
	{/if}
</div>
