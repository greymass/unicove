<!-- .../proposals/[vp]/sentiment/+page.svelte -->
<script lang="ts">
	import { getContext } from 'svelte';
	import { Stack } from 'unicove-components';
	import { Name } from '@wharfkit/antelope';
	import { page } from '$app/state';
	import type { UnicoveContext } from '$lib/state/client.svelte';
	import VpSentimentHero from '$lib/components/vp/VpSentimentHero.svelte';
	import VpSentimentStepRow from '$lib/components/vp/VpSentimentStepRow.svelte';
	import {
		vpMsigPollRows,
		vpProposalTopicRows,
		vpSentimentRowKey,
		type VpMsigPollRow,
		type VpSentimentRowModel
	} from '$lib/vp/sentiment';
	import type { PageData } from './$types';

	interface Props {
		data: PageData;
	}

	const { data }: Props = $props();
	const context = getContext<UnicoveContext>('state');

	const locale = $derived(context.settings.data.locale);
	const basePath = $derived(context.urlPath(`/proposals/${page.params.vp}`));
	const topicRows = $derived(vpProposalTopicRows(data.summary));
	const msigRows = $derived(vpMsigPollRows(data.summary, locale));
	const hasContent = $derived(topicRows.length > 0 || msigRows.length > 0);

	function stepQuestion(row: VpMsigPollRow): string {
		const titled = 'Should this step be signed and executed:';
		const plain = 'Should this transaction be signed and executed?';
		return row.title ? `${titled} ${row.title}?` : plain;
	}

	let votes = $state<Record<string, number | null>>({});

	$effect(() => {
		const account = context.account;
		if (!account) {
			votes = {};
			return;
		}
		for (const row of [...topicRows, ...msigRows]) {
			if (row.votable) loadVote(account.name, row);
		}
	});

	async function loadVote(voter: Name, row: VpSentimentRowModel) {
		const key = vpSentimentRowKey(row);
		try {
			if (row.kind === 'proposal') {
				const result = await context.network.contracts.sentiment.readonly('getvote', {
					voter,
					topic_id: Name.from(row.topic)
				});
				votes[key] = result ? Number(result.vote_type) : null;
			} else {
				const result = await context.network.contracts.sentiment.readonly('getmsigvote', {
					voter,
					proposer: Name.from(row.proposer),
					proposal_name: Name.from(row.proposal)
				});
				votes[key] = result ? Number(result.vote_type) : null;
			}
		} catch {
			votes[key] = null;
		}
	}
</script>

<Stack class="max-w-[80ch] gap-8">
	{#if !hasContent}
		<p class="text-muted text-sm">
			No sentiment yet. Voting opens when a topic is published or a multisig is proposed.
		</p>
	{:else}
		{#if topicRows.length}
			<Stack class="gap-3">
				<h2 class="text-title">Sentiment on the proposal</h2>
				{#each topicRows as row (vpSentimentRowKey(row))}
					<VpSentimentHero
						{row}
						{basePath}
						question="Do you support {data.summary.vp}: {data.summary.title}?"
						currentVote={votes[vpSentimentRowKey(row)]}
						onVoted={(voteType) => (votes[vpSentimentRowKey(row)] = voteType)}
					/>
				{/each}
			</Stack>
		{/if}

		{#if msigRows.length}
			<Stack class="gap-3">
				<h2 class="text-title">Sentiment on each step</h2>
				<p class="text-muted text-sm">
					Each step is a separate on-chain transaction with its own poll. Signers weigh these
					results when deciding whether to approve.
				</p>
				{#each msigRows as row (vpSentimentRowKey(row))}
					<VpSentimentStepRow
						{row}
						{basePath}
						question={stepQuestion(row)}
						currentVote={votes[vpSentimentRowKey(row)]}
						onVoted={(voteType) => (votes[vpSentimentRowKey(row)] = voteType)}
					/>
				{/each}
			</Stack>
		{/if}
	{/if}
</Stack>
