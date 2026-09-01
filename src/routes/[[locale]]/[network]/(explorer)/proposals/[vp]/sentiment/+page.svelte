<!-- .../proposals/[vp]/sentiment/+page.svelte -->
<script lang="ts">
	import { getContext } from 'svelte';
	import { Stack } from 'unicove-components';
	import { Name } from '@wharfkit/antelope';
	import { page } from '$app/state';
	import type { UnicoveContext } from '$lib/state/client.svelte';
	import VpSentimentHero from '$lib/components/vp/VpSentimentHero.svelte';
	import { vpProposalTopicRows, type VpProposalTopicRow } from '$lib/vp/sentiment';
	import type { PageData } from './$types';

	interface Props {
		data: PageData;
	}

	const { data }: Props = $props();
	const context = getContext<UnicoveContext>('state');

	const basePath = $derived(context.urlPath(`/proposals/${page.params.vp}`));
	const topicRows = $derived(vpProposalTopicRows(data.summary));

	let votes = $state<Record<string, number | null>>({});

	$effect(() => {
		const account = context.account;
		if (!account) {
			votes = {};
			return;
		}
		for (const row of topicRows) loadVote(account.name, row);
	});

	async function loadVote(voter: Name, row: VpProposalTopicRow) {
		try {
			const result = await context.network.contracts.sentiment.readonly('getvote', {
				voter,
				topic_id: Name.from(row.topic)
			});
			votes[row.topic] = result ? Number(result.vote_type) : null;
		} catch {
			votes[row.topic] = null;
		}
	}
</script>

<Stack class="gap-8">
	{#if !topicRows.length}
		<p class="text-muted text-sm">
			No sentiment yet. Voting opens when a topic is published for this proposal.
		</p>
	{:else}
		{#each topicRows as row (row.topic)}
			<VpSentimentHero
				{row}
				{basePath}
				question="Do you support {data.summary.vp}: {data.summary.title}?"
				currentVote={votes[row.topic]}
				onVoted={(voteType) => (votes[row.topic] = voteType)}
			/>
		{/each}
	{/if}
</Stack>
