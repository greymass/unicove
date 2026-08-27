<script lang="ts">
	import { getContext } from 'svelte';
	import { Stack } from 'unicove-components';
	import { SvelteMap } from 'svelte/reactivity';
	import Thread from '$lib/components/discussion/Thread.svelte';
	import { topicDescriptor } from '$lib/discussion/targets';
	import type { UnicoveContext } from '$lib/state/client.svelte';

	const { data } = $props();
	const context = getContext<UnicoveContext>('state');
	const descriptor = $derived(
		topicDescriptor(String(context.network.contracts.sentiment.account), data.topicId)
	);
	const votes = $derived(new Map(data.sentiment.currentVotes.map((v) => [v.voter, v.voteType])));
	const userVotes = new SvelteMap<string, number | null>();
	$effect(() => {
		userVotes.set(descriptor.key, data.sentiment.currentUserVote?.vote_type ?? null);
	});
	$effect(() => {
		if (context.account?.name) data.sentiment.loadUserVote(context.account.name, data.topicId);
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
				if (context.account) data.sentiment.updateUserVote(context.account.name, data.topicId, v);
			}}
			showChips={false}
			locale={data.locale || 'en'}
		/>
	</Stack>
</article>
