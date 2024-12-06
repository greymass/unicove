import { json, type RequestEvent } from '@sveltejs/kit';

import { getChainDefinitionFromParams, NetworkState } from '$lib/state/network.svelte';
import { getCacheHeaders } from '$lib/utils';
import { getBackendNetwork, getLightAPIURL } from '$lib/wharf/client/ssr';

export async function GET({ fetch, params }: RequestEvent) {
	const chain = getChainDefinitionFromParams(String(params.network));
	if (!chain) {
		return json({ error: 'Invalid chain specified' }, { status: 400 });
	}
	const network = getBackendNetwork(chain, fetch, true);
	if (!params.contract) {
		return json({ error: 'Invalid contract specified' }, { status: 400 });
	}
	if (!params.symbol) {
		return json({ error: 'Invalid symbol specified' }, { status: 400 });
	}
	const contract = params.contract.toLocaleLowerCase();
	const symbol = params.symbol?.toLocaleUpperCase();
	const stats = await network.client.v1.chain.get_currency_stats(contract, symbol);
	const topholders = await getTopHolders(network, contract, symbol);
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
	const response = await fetch(
		`${getLightAPIURL(network.shortname)}/api/topholders/${network}/${contract}/${symbol}/${number}`
	);
	return (await response.json()).map((result: string[]) => ({
		account: result[0],
		balance: result[1]
	}));
}

async function getNumHolders(network: NetworkState, contract: string, symbol: string) {
	const response = await fetch(
		`${getLightAPIURL(network.shortname)}/api/holdercount/${network}/${contract}/${symbol}`
	);
	return response.json();
}
