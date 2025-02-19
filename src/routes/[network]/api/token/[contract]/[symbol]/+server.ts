import { json } from '@sveltejs/kit';

import { NetworkState } from '$lib/state/network.svelte';
import { getCacheHeaders } from '$lib/utils';
import type { RequestEvent } from './$types';

export async function GET({ locals: { network }, params, url }: RequestEvent) {
	const contract = params.contract.toLocaleLowerCase();
	const symbol = params.symbol?.toLocaleUpperCase();
	const count = Number(url.searchParams.get('count')) || 100;
	const stats = await network.client.v1.chain.get_currency_stats(contract, symbol);
	const topholders = await getTopHolders(network, contract, symbol, count);
	const numholders = await getNumHolders(network, contract, symbol);

	return json(
		{
			ts: new Date(),
			numholders,
			topholders,
			stats: {
				supply: stats[symbol].supply,
				max_supply: stats[symbol].max_supply,
				issuer: stats[symbol].issuer
			}
		},
		{
			headers: getCacheHeaders(3600)
		}
	);
}

async function getTopHolders(
	network: NetworkState,
	contract: string,
	symbol: string,
	number = 100
) {
	const response = await network.fetch(
		`${network.config.endpoints.lightapi}/api/topholders/${network}/${contract}/${symbol}/${number}`
	);
	return (await response.json()).map((result: string[]) => ({
		account: result[0],
		balance: result[1]
	}));
}

async function getNumHolders(network: NetworkState, contract: string, symbol: string) {
	const response = await network.fetch(
		`${network.config.endpoints.lightapi}/api/holdercount/${network}/${contract}/${symbol}`
	);
	return response.json();
}
