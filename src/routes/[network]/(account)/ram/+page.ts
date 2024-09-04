import { Asset } from '@wharfkit/antelope';

import type { LoadEvent } from '@sveltejs/kit';

interface HistoricalPrice {
	date: Date;
	value: Asset;
}

interface LoadData {
	historicalPrices: HistoricalPrice[];
}

export async function load({ fetch, params }: LoadEvent): Promise<LoadData> {
	const { network } = params;
	let historicalPrices: HistoricalPrice[] = [];

	try {
		const response: Response = await fetch(`/${network}/api/metrics/marketprice/ram`);
		const parsedResponse: any[] = await response.json();
		historicalPrices = parsedResponse.map((price: { date: string; value: number }) => ({
			date: new Date(price.date),
			value: Asset.from(price.value / 10000, '4,EOS') // Assuming EOS for now, we'll adjust this later
		}));
	} catch (error: unknown) {
		console.error('Error fetching historical RAM prices:', error);
	}

	return { historicalPrices };
}
