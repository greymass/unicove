<script lang="ts">
	import { getContext } from 'svelte';
	import { Name } from '@wharfkit/antelope';
	import SentimentMeter from '$lib/components/sentiment/SentimentMeter.svelte';
	import VoteButtons from '$lib/components/sentiment/voteButtons.svelte';
	import type { UnicoveContext } from '$lib/state/client.svelte';
	import type {
		TopicStatistics,
		ApiResponse,
		TopicDetailData,
		MsigDetailData
	} from '$lib/types/sentiment';
	import type { TargetDescriptor } from '$lib/discussion/targets';

	interface Props {
		descriptor: TargetDescriptor;
		vote: number | null | undefined;
		onvote: (voteType: number | null) => void;
	}

	const { descriptor, vote, onvote }: Props = $props();
	const context = getContext<UnicoveContext>('state');

	let statistics = $state<TopicStatistics | null>(null);

	$effect(() => {
		const target = descriptor.target;
		const path =
			target.kind === 'msig'
				? `/api/sentiment/msigs/${target.proposer}/${target.proposal}`
				: `/api/sentiment/topics/${target.topic}`;
		const controller = new AbortController();
		statistics = null;
		fetch(context.urlPath(path), { signal: controller.signal })
			.then((response) => response.json())
			.then((result: ApiResponse<TopicDetailData | MsigDetailData>) => {
				if (result.success && result.data) statistics = result.data.statistics;
			})
			.catch(() => {});
		return () => controller.abort();
	});
</script>

<div class="grid gap-3">
	{#if statistics}
		<SentimentMeter id="discussion-{descriptor.key}" compact {statistics} />
	{/if}
	{#if descriptor.postable}
		{#if descriptor.target.kind === 'msig'}
			<VoteButtons
				type="msig"
				proposer={Name.from(descriptor.target.proposer)}
				proposalName={Name.from(descriptor.target.proposal)}
				currentVote={vote}
				showVoter={false}
				onVoteSuccess={(_, voteType) => onvote(voteType ?? null)}
			/>
		{:else}
			<VoteButtons
				type="topic"
				topicId={Name.from(descriptor.target.topic)}
				currentVote={vote}
				showVoter={false}
				onVoteSuccess={(_, voteType) => onvote(voteType ?? null)}
			/>
		{/if}
	{/if}
</div>
