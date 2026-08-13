<script lang="ts">
	import VoteButtons from '$lib/components/sentiment/voteButtons.svelte';
	import type { VpSentimentMsigAction, VpSentimentTopicAction } from '$lib/vp/actions';

	interface Props {
		model: VpSentimentTopicAction | VpSentimentMsigAction;
		currentVote: number | null;
		onVoted: (voteType: number | null) => void;
	}

	const { model, currentVote, onVoted }: Props = $props();
</script>

<div class="grid gap-2">
	<h3 class="text-label-sm text-muted">
		{#if model.kind === 'sentiment-topic'}
			Sentiment on this proposal
		{:else}
			Sentiment on the multisig {model.proposer}/{model.proposal}
		{/if}
	</h3>
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
