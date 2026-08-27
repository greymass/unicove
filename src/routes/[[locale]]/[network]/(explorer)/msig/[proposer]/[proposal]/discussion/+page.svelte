<script lang="ts">
	import { getContext, onMount } from 'svelte';
	import { Stack } from 'unicove-components';
	import Thread from '$lib/components/discussion/Thread.svelte';
	import { msigDescriptor } from '$lib/discussion/targets';
	import type { MsigSentimentState } from '$lib/state/sentiment/msig.svelte';
	import type { UnicoveContext } from '$lib/state/client.svelte';
	import { SvelteMap } from 'svelte/reactivity';

	const { data } = $props();
	const context = getContext<UnicoveContext>('state');
	const sentimentState = getContext<MsigSentimentState>('msig-sentiment');

	const descriptor = $derived(
		msigDescriptor(data.proposal.proposer, data.proposal.name, data.proposal.status)
	);
	const votes = $derived(new Map(sentimentState.currentVotes.map((v) => [v.voter, v.voteType])));
	const userVotes = new SvelteMap<string, number | null>();
	$effect(() => {
		userVotes.set(descriptor.key, sentimentState.currentUserVote?.vote_type ?? null);
	});

	onMount(() => {
		if (sentimentState.currentVotes.length === 0) {
			sentimentState.loadMsigVotes(data.proposal.proposer, data.proposal.name, 1, 50, 'system');
		}
	});
</script>

<article class="@container">
	<Stack class="gap-6">
		<h2 class="text-on-surface text-headline">Discussion</h2>
		<Thread
			descriptors={[descriptor]}
			active={descriptor}
			onselect={() => {}}
			{votes}
			{userVotes}
			onuservote={(d, v) => {
				userVotes.set(d.key, v);
				if (context.account) {
					sentimentState.loadUserVote(
						context.account.name,
						data.proposal.proposer,
						data.proposal.name
					);
				}
			}}
			showChips={false}
			locale={data.locale || 'en'}
		/>
	</Stack>
</article>
