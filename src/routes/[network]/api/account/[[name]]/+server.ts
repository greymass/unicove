import { json } from '@sveltejs/kit';
import { getChainDefinitionFromParams, getNetwork, NetworkState } from '$lib/state/network.svelte';
import { getCacheHeaders } from '$lib/utils';
import type { LightAPIBalanceResponse, LightAPIBalanceRow } from '$lib/types.js';
import type { RequestHandler } from './$types';
import { Asset, type NameType } from '@wharfkit/antelope';

export const GET: RequestHandler = async ({ fetch, params }) => {
	const chain = getChainDefinitionFromParams(params.network);
	if (!chain) {
		return json({ error: 'Invalid chain specified' }, { status: 400 });
	}

	if (!params.name) {
		return json({ error: 'Account name not specified.' }, { status: 500 });
	}

	const network = getNetwork(chain, fetch);
	const { system: systemContract } = network.contracts;

	try {
		const headers = getCacheHeaders(5);
		const [account_data, delegated, rex, balances] = await Promise.all([
			network.client.v1.chain.get_account(params.name),
			systemContract.table('delband').all({ scope: params.name }),
			systemContract.table('rexbal').get(params.name),
			loadBalances(network, params.name, fetch)
		]);

		// If no response from the light API, add the core liquid balance as a default if it exists
		if (!balances.length && chain.systemToken) {
			const symbol = Asset.Symbol.from(network.config.symbol);
			balances.push({
				contract: String(chain.systemToken.contract),
				amount: '0',
				decimals: String(symbol.precision),
				currency: String(symbol.code)
			});
		}

		return json(
			{
				ts: new Date(),
				account_data,
				balances,
				delegated,
				rex
			},
			{ headers }
		);
	} catch (error) {
		console.error(error);
		return json({ error: 'Unable to load account.' }, { status: 500 });
	}
};

async function loadBalances(
	network: NetworkState,
	account: NameType,
	f: typeof fetch
): Promise<LightAPIBalanceRow[]> {
	const balances = [];
	if (network.supports('lightapi')) {
		const result = await f(`https://balances.unicove.com/api/balances/${network}/${account}`);
		const json: LightAPIBalanceResponse = await result.json();
		balances.push(...json.balances);
	}
	return balances;
}
