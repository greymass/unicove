<script lang="ts">
	import { getContext } from 'svelte';
	import { Asset } from '@wharfkit/antelope';
	import ChartContainer from './chart-container.svelte';
	import type { MarketContext, UnicoveContext } from '$lib/state/client.svelte';
	import type { HistoricalPrice } from '$lib/types';
	import type { MarketPricePoint } from '$lib/utils/marketprice';
	import { ramtoken } from '$lib/wharf/chains';
	import { ZeroUnits } from '$lib/types/token';

	const { network } = getContext<UnicoveContext>('state');
	const market = getContext<MarketContext>('market');

	let { prices }: { prices: MarketPricePoint[] } = $props();

	const ramPrices: HistoricalPrice[] = $derived(
		prices.map((price) => ({
			date: new Date(price.date),
			value: Asset.from(price.value / 10000, network.chain.systemToken?.symbol || '0,UNKNOWN')
		}))
	);

	let systemtoken = Asset.Symbol.from(network.config.systemtoken.symbol);
	let pair = $derived(`${ramtoken.name}/${systemtoken.name}`);
</script>

{#if ramPrices.length}
	{@const latest = {
		date: new Date(),
		value: market.network.ramtoken.price.units.gt(ZeroUnits)
			? market.network.ramtoken.price
			: ramPrices[0].value
	}}
	<ChartContainer {pair} data={[latest, ...ramPrices]} type="line" />
{/if}
