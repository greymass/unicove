import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { Asset } from '@wharfkit/antelope';
import { getCacheHeaders } from '$lib/utils';

interface HistoricalPrice {
	date: Date;
	value: Asset;
}

export const GET: RequestHandler = async ({ locals: { network } }) => {
	try {
		if (!network.config.endpoints.metrics) {
			return json([]);
		}
		const response = await fetch(`${network.config.endpoints.metrics}/marketprice/ram/1h/7d`);
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
		console.warn(error);
		return json([]);
	}
};
