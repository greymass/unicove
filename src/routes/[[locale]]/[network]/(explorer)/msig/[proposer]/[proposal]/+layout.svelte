<script lang="ts">
	import { Stack } from 'unicove-components';
	import PillGroup from '$lib/components/navigation/pillgroup.svelte';
	import type { UnicoveContext } from '$lib/state/client.svelte.js';
	import { getContext, onMount, setContext } from 'svelte';
	import { MsigSentimentState } from '$lib/state/sentiment/msig.svelte';

	const { children, data } = $props();
	const context = getContext<UnicoveContext>('state');

	const sentimentState = $state(new MsigSentimentState(context.network, data.locale));
	setContext('msig-sentiment', sentimentState);

	onMount(() => {
		if (context.network.supports('sentiment')) {
			sentimentState.loadMsig(data.proposal.proposer, data.proposal.name);
			if (context.account) {
				sentimentState.loadUserVote(
					context.account.name,
					data.proposal.proposer,
					data.proposal.name
				);
			}
		}
	});

	const tabOptions = $derived.by(() => {
		let urlBase = context.urlPath(`/msig/${data.proposal.proposer}/${data.proposal.name}`);
		const tabs = [{ href: urlBase, text: 'Status' }];
		if (context.network.supports('sentiment')) {
			const votes = sentimentState.currentMsig?.statistics.totalVotes;
			tabs.push({
				href: `${urlBase}/sentiment`,
				text: votes !== undefined ? `Sentiment (${votes})` : 'Sentiment'
			});
		}
		tabs.push(
			{ href: `${urlBase}/actions`, text: `Actions (${data.proposal.transaction.actions.length})` },
			{ href: `${urlBase}/transaction`, text: 'Transaction' },
			{ href: `${urlBase}/data`, text: 'Data' }
		);
		return tabs;
	});
</script>

<Stack class="@container">
	<PillGroup options={tabOptions} />
	{@render children?.()}
</Stack>
