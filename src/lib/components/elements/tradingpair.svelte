<script lang="ts">
	import AssetText from '$lib/components/elements/asset.svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import type { TokenHistoricPrice, TokenPair } from '$lib/types/token';
	import { cn } from '$lib/utils/style';
	import { Triangle } from 'lucide-svelte';

	interface Props extends HTMLAttributes<HTMLSpanElement> {
		historic?: TokenHistoricPrice;
		historicTimeframe?: string;
		value: TokenPair;
	}

	let { historic, historicTimeframe, value: pair, ...props }: Props = $props();

	const percentChange = $derived(
		historic ? ((pair.price.value - historic.value.value) / historic.value.value) * 100 : undefined
	);
	const percentChangePositive = $derived(percentChange ? percentChange > 0 : undefined);
	const percentChangeString = $derived(percentChange ? percentChange.toFixed(2) : undefined);
	const timeframeString = $derived.by(() => {
		let timeframe = '1d';
		switch (historicTimeframe) {
			case 'week':
				timeframe = '1w';
				break;
			case 'month':
				timeframe = '1mo';
				break;
			case 'quarter':
				timeframe = '3mo';
				break;
			case 'year':
				timeframe = '1y';
				break;
			default:
				break;
		}
		return timeframe;
	});
</script>

<span class={cn('flex flex-wrap gap-2', props.class)}>
	<span>
		<AssetText value={pair.price} />
		{pair.base.symbol.code}/{pair.quote.symbol.code}
	</span>
	{#if historic}
		{#if percentChangePositive}
			<span class="text-success inline-flex items-center gap-1.5 leading-none">
				<Triangle fill="currentColor" class="size-2" />
				{percentChangeString}% {timeframeString}
			</span>
		{:else}
			<span class="text-error inline-flex items-center gap-1.5 leading-none">
				<Triangle fill="currentColor" class="size-2 rotate-180" />
				{percentChangeString}% {timeframeString}
			</span>
		{/if}
	{/if}
</span>
