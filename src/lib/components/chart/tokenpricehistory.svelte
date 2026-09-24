<script lang="ts">
	import { getContext } from 'svelte';
	import { Asset } from '@wharfkit/antelope';
	import ChartContainer from './chart-container.svelte';
	import type { MarketContext, UnicoveContext } from '$lib/state/client.svelte';
	import type { HistoricalPrice } from '$lib/types';
	import type { MarketPricePoint } from '$lib/utils/marketprice';
	import { Currencies } from '$lib/types/currencies';
	import { calculateValue } from '$lib/utils';

	const context = getContext<UnicoveContext>('state');
	const market = getContext<MarketContext>('market');

	let { prices }: { prices: MarketPricePoint[] } = $props();

	let systemtoken = Asset.Symbol.from(context.network.config.systemtoken.symbol);
	let currency = $derived(Currencies[context.settings.data.displayCurrency]);
	let pair = $derived(String(systemtoken.name) + '/' + currency.symbol.name);

	const tokenPrices: HistoricalPrice[] = $derived.by(() => {
		if (!prices.length) {
			return [];
		}
		const usdPair = market.market.getPair(Currencies.USD, currency);
		const converted = prices.map((price): HistoricalPrice => {
			let value = Asset.from(price.value / 10000, '4,USD');
			if (usdPair) {
				value = calculateValue(value, usdPair.price);
			}
			return {
				date: new Date(price.date),
				value
			};
		});
		const tokenpair = market.market.getPair(context.network.token.id, currency);
		if (tokenpair) {
			converted.unshift({
				date: new Date(),
				value: tokenpair.price
			});
		}
		return converted;
	});
</script>

{#if tokenPrices.length}
	<ChartContainer {pair} data={tokenPrices} type="line" />
{/if}
