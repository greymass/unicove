import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { Asset } from '@wharfkit/antelope';
import { API_EOS_METRICS } from '$env/static/private';
import { getChainDefinitionFromParams } from '$lib/state/network.svelte';
import type { ChainDefinition } from '@wharfkit/common';

function getMetricsUrl(chain: ChainDefinition): string {
	switch (chain.name) {
		case 'eos':
			return API_EOS_METRICS;
		default:
			throw new Error(`Unsupported chain: ${chain.name}`);
	}
}

export const GET: RequestHandler = async ({ params }) => {
	const chain = getChainDefinitionFromParams(params.network);
	const metricsUrl = getMetricsUrl(chain);

	try {
		const response = await fetch(`${metricsUrl}/marketprice/ram`);
		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}
		const parsedResponse = await response.json();

		const historicalPrices = parsedResponse
			.map((price: any) => ({
				date: new Date(price.time_point),
				value: Asset.from(price.ram_price, '4,EOS').toString()
			}))
			.sort((a: any, b: any) => b.date.getTime() - a.date.getTime());

		return json(historicalPrices);
	} catch (error) {
		console.error('Error fetching historical RAM prices:', error);
		return json({ error: 'Failed to fetch RAM price history' }, { status: 500 });
	}
};
