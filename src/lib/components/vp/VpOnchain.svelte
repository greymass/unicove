<script lang="ts">
	import { Details, Stack } from 'unicove-components';
	import VpMsigCard from './VpMsigCard.svelte';
	import VpMsigRow from './VpMsigRow.svelte';
	import VpSentimentCard from './VpSentimentCard.svelte';
	import VpRelatedAccounts from './VpRelatedAccounts.svelte';
	import { msigCardModels, partitionMsigCardModels } from '$lib/vp/onchain';
	import type { VpSummary } from '$lib/vp/types';

	interface Props {
		summary: VpSummary;
	}

	const { summary }: Props = $props();
	const partition = $derived(partitionMsigCardModels(msigCardModels(summary)));
	const hasContent = $derived(
		partition.live.length > 0 ||
			partition.finished.length > 0 ||
			summary.sentiment.length > 0 ||
			summary.accounts.length > 0
	);
</script>

{#if hasContent}
	<Stack class="gap-4">
		<h2 class="text-label-sm text-muted">On-chain</h2>
		{#each partition.live as model (model.msigPath)}
			<VpMsigCard {model} />
		{/each}
		{#if partition.finished.length}
			<Details>
				{#snippet header()}
					<span class="text-label-sm">Earlier multisigs ({partition.finished.length})</span>
				{/snippet}
				<Stack class="gap-3">
					{#each partition.finished as model (model.msigPath)}
						<VpMsigRow {model} />
					{/each}
				</Stack>
			</Details>
		{/if}
		{#each summary.sentiment as ref (ref.contract + ref.topic)}
			<VpSentimentCard contract={ref.contract} topic={ref.topic} />
		{/each}
		<VpRelatedAccounts accounts={summary.accounts} />
	</Stack>
{/if}
