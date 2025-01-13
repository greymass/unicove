import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { Asset } from '@wharfkit/antelope';
import { API_EOS_METRICS } from '$env/static/private';
import { getChainDefinitionFromParams } from '$lib/state/network.svelte';
import type { ChainDefinition } from '@wharfkit/common';
import { getCacheHeaders } from '$lib/utils';

interface HistoricalPrice {
	date: Date;
	value: Asset;
}

function getMetricsUrl(chain: ChainDefinition): string {
	switch (chain.name) {
		case 'EOS':
			return API_EOS_METRICS;
		default:
			throw new Error(`Unsupported chain: ${chain.name}`);
	}
}

export const GET: RequestHandler = async ({ params }) => {
	try {
		const chain = getChainDefinitionFromParams(params.network);
		const metricsUrl = getMetricsUrl(chain);
		if (!metricsUrl) {
			return json([]);
		}
		const response = await fetch(`${metricsUrl}/marketprice/ram/1h/7d`);
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
