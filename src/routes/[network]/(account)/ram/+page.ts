import { Asset } from '@wharfkit/antelope';

import type { LoadEvent } from '@sveltejs/kit';
import { getChainDefinitionFromParams } from '$lib/state/network.svelte';

interface HistoricalPrice {
	date: Date;
	value: Asset;
}

interface LoadData {
	historicalPrices: HistoricalPrice[];
}

export async function load({ fetch, params }: LoadEvent): Promise<LoadData> {
	const { network } = params;

	const chain = getChainDefinitionFromParams(String(network));

	let historicalPrices: HistoricalPrice[] = [];

	try {
		const response: Response = await fetch(`/${network}/api/metrics/marketprice/ram`);
		const parsedResponse: { date: string; value: number }[] = await response.json();
		historicalPrices = parsedResponse.map((price: { date: string; value: number }) => ({
			date: new Date(price.date),
			value: Asset.from(price.value / 10000, chain.systemToken?.symbol || '0,UNKNOWN')
		}));
	} catch (error: unknown) {
		console.error('Error fetching historical RAM prices:', error);
	}

	return { historicalPrices };
}
