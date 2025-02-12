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

	const fetchRamPrices = async () => {
		try {
			const response = await fetch(`/${network}/api/metrics/marketprice/ram`);
			const parsedRamResponse: APIResponse = await response.json();

			if (Array.isArray(parsedRamResponse) && parsedRamResponse.length) {
				return parsedRamResponse.map(
					(price: Price) =>
						({
							date: new Date(price.date),
							value: Asset.from(
								price.value / 10000,
								network.chain.systemToken?.symbol || '0,UNKNOWN'
							)
						}) as HistoricalPrice
				);
			} else if ('error' in parsedRamResponse && parsedRamResponse.error) {
				throw new Error(String(parsedRamResponse.error));
			} else {
				throw new Error('Error fetching RAM prices');
			}
		} catch (e) {
			throw new Error(String(e));
		}
	};

	let systemtoken = Asset.Symbol.from(network.config.systemtoken.symbol);
	let pair = $derived(String(systemtoken.name) + '/RAM');
</script>

{#await fetchRamPrices()}
	<Loading {pair} />
{:then ramPrices}
	<ChartContainer {pair} data={ramPrices} type="line" />
{/await}
