import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { Asset } from '@wharfkit/antelope';
import { getCacheHeaders } from '$lib/utils';
import { getChainConfigByNamePrivate } from '$lib/wharf/client/ssr';

interface HistoricalPrice {
	date: Date;
	value: Asset;
}

export const GET: RequestHandler = async ({ params }) => {
	try {
		const config = getChainConfigByNamePrivate(params.network);
		if (!config.endpoints.metrics) {
			return json([]);
		}
		const response = await fetch(`${config.endpoints.metrics}/marketprice/ram/1h/7d`);
		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}
		const parsedResponse = await response.json();

		const historicalPrices = parsedResponse.sort(
			(a: HistoricalPrice, b: HistoricalPrice) =>
				new Date(b.date).getTime() - new Date(a.date).getTime()
		);

		return json(historicalPrices, {
			headers: getCacheHeaders(30)
		});
	} catch (error) {
		console.log(error);
		return json([]);
	}
};
