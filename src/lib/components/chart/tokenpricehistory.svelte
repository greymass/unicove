<script lang="ts">
	import { getContext } from 'svelte';
	import { Asset } from '@wharfkit/antelope';
	import ChartContainer from './chart-container.svelte';
	import type { UnicoveContext } from '$lib/state/client.svelte';
	import type { HistoricalPrice } from '$lib/types';
	import Loading from './loading.svelte';

	const { network } = getContext<UnicoveContext>('state');

	type Price = { date: string; value: number };
	type APIResponse = Price[] | { error: string };

	const fetchTokenPrices = async () => {
		if (network.supports('timeseries')) {
			try {
				const response = await fetch(`/${network}/api/metrics/marketprice/token`);
				const parsedTokenResponse: APIResponse = await response.json();

				if (Array.isArray(parsedTokenResponse) && parsedTokenResponse.length) {
					return parsedTokenResponse.map(
						(price: Price) =>
							({
								date: new Date(price.date),
								value: Asset.from(price.value / 10000, '4,USD')
							}) as HistoricalPrice
					);
				} else if ('error' in parsedTokenResponse && parsedTokenResponse.error) {
					throw new Error(String(parsedTokenResponse.error));
				} else {
					throw new Error('Error fetching RAM prices');
				}
			} catch (e) {
				throw new Error(String(e));
			}
		} else {
			return [];
		}
	};

	let systemtoken = Asset.Symbol.from(network.config.systemtoken.symbol);
	let pair = $derived(String(systemtoken.name) + '/USD');
</script>

{#await fetchTokenPrices()}
	<Loading {pair} />
{:then prices}
	{#if prices.length}
		<ChartContainer {pair} data={prices} type="line" />
	{/if}
{/await}
