<script lang="ts">
	import { getContext } from 'svelte';
	import type { UnicoveContext } from '$lib/state/client.svelte';
	import VoteButtons from '$lib/components/sentiment/voteButtons.svelte';
	import type { VpSentimentMsigAction, VpSentimentTopicAction } from '$lib/vp/actions';

	interface Props {
		model: VpSentimentTopicAction | VpSentimentMsigAction;
		currentVote: number | null;
		onVoted: (voteType: number | null) => void;
	}

	const { model, currentVote, onVoted }: Props = $props();
	const context = getContext<UnicoveContext>('state');
</script>

<div class="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
	<div class="grid gap-1">
		<h3 class="text-label-sm text-muted">
			{#if model.kind === 'sentiment-topic'}
				Sentiment on this proposal
			{:else}
				Sentiment on the multisig {model.proposer}/{model.proposal}
			{/if}
		</h3>
		{#if model.kind === 'sentiment-msig'}
			<a class="text-primary text-sm hover:underline" href={context.urlPath(model.msigPath)}>
				Approve on the multisig page
			</a>
		{/if}
	</div>
	<div class="max-w-sm min-w-72 flex-1">
		{#if model.kind === 'sentiment-topic'}
			<VoteButtons
				type="topic"
				topicId={model.topic}
				{currentVote}
				showVoter={false}
				onVoteSuccess={(_id, voteType) => onVoted(voteType ?? null)}
			/>
		{:else}
			<VoteButtons
				type="msig"
				proposer={model.proposer}
				proposalName={model.proposal}
				{currentVote}
				showVoter={false}
				onVoteSuccess={(_id, voteType) => onVoted(voteType ?? null)}
			/>
		{/if}
	</div>
</div>
