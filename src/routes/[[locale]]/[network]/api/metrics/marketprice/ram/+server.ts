import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getCacheHeaders } from '$lib/utils';
import type { HistoricalPrice } from '$lib/types';

export const GET: RequestHandler = async ({ fetch, locals: { network } }) => {
	try {
		if (!network.config.endpoints.metrics) {
			return json([]);
		}
		const url = `${network.config.endpoints.metrics}/marketprice/ram/1h/1mo`;
		const response = await fetch(url);
		if (!response.ok) {
			throw new Error(`HTTP ${response.status} from ${url}`);
		}
		const parsedResponse = await response.json();

		const historicalPrices = parsedResponse.sort(
			(a: HistoricalPrice, b: HistoricalPrice) =>
				new Date(b.date).getTime() - new Date(a.date).getTime()
		);

		return json(historicalPrices, {
			headers: getCacheHeaders(3600)
		});
	} catch (error) {
		console.warn(error);
		return json([]);
	}
};
