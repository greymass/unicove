import { Asset } from '@wharfkit/antelope';

import type { LoadEvent } from '@sveltejs/kit';
import { getChainDefinitionFromParams } from '$lib/state/network.svelte';
import type { HistoricalPrice } from '$lib/types';

interface LoadData {
	historicalPrices: HistoricalPrice[];
}

export async function load({ fetch, params }: LoadEvent): Promise<LoadData> {
	const { network } = params;

	const chain = getChainDefinitionFromParams(String(network));

	let historicalPrices: HistoricalPrice[] = [];

	try {
		const response: Response = await fetch(`/${network}/api/metrics/marketprice/ram`);
		const parsedResponse: { date: string; value: number }[] | { error: string } =
			await response.json();
		if ('error' in parsedResponse && parsedResponse.error) {
			throw new Error(String(parsedResponse.error));
		} else if (Array.isArray(parsedResponse)) {
			historicalPrices = parsedResponse.map((price: { date: string; value: number }) => ({
				date: new Date(price.date),
				value: Asset.from(price.value / 10000, chain.systemToken?.symbol || '0,UNKNOWN')
			}));
		}
	} catch (error: unknown) {
		console.error('Error fetching historical RAM prices:', error);
	}

	return { historicalPrices };
}
