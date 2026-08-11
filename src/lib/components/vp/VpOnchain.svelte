<script lang="ts">
	import { Stack } from 'unicove-components';
	import VpMsigCard from './VpMsigCard.svelte';
	import VpSentimentCard from './VpSentimentCard.svelte';
	import { msigCardModels } from '$lib/vp/onchain';
	import type { VpSummary } from '$lib/vp/types';

	interface Props {
		summary: VpSummary;
	}

	const { summary }: Props = $props();
	const models = $derived(msigCardModels(summary));
</script>

{#if models.length || summary.sentiment.length}
	<Stack class="gap-4">
		<h2 class="text-label-sm text-muted">On-chain activity</h2>
		{#each models as model (model.msigPath)}
			<VpMsigCard {model} />
		{/each}
		{#each summary.sentiment as ref (ref.contract + ref.topic)}
			<VpSentimentCard contract={ref.contract} topic={ref.topic} />
		{/each}
	</Stack>
{/if}
