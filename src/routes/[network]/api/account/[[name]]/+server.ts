import { json } from '@sveltejs/kit';

import { getChainDefinitionFromParams, getNetwork, NetworkState } from '$lib/state/network.svelte';
import { type API, type NameType } from '@wharfkit/antelope';
import type { TokenBalance } from '@wharfkit/common';
import type { ChainDefinition } from '@wharfkit/session';
import { chainMapper } from '$lib/wharf/chains.js';
import { getCacheHeaders } from '$lib/utils';
import { SystemContract } from '@wharfkit/account';
import type { LightAPIBalanceResponse, LightAPIBalanceRow } from '$lib/types.js';

export async function GET({ fetch, params }) {
	const chain = getChainDefinitionFromParams(params.network);
	if (!chain) {
		return json({ error: 'Invalid chain specified' }, { status: 400 });
	}

	if (!params.name) {
		return json({ error: 'Account name not specified.' }, { status: 500 });
	}

	const network = getNetwork(chain, fetch);
	const { system: systemContract } = network.contracts;

	const requests: [
		Promise<API.v1.AccountObject>,
		Promise<SystemContract.Types.delegated_bandwidth[]>,
		Promise<SystemContract.Types.rex_balance>,
		Promise<SystemContract.Types.rex_fund>,
		Promise<LightAPIBalanceRow[]>
	] = [
		network.client.v1.chain.get_account(params.name),
		systemContract.table('delband').all({ scope: params.name }),
		systemContract.table('rexbal').get(params.name),
		systemContract.table('rexfund').get(params.name),
		loadBalances(network, params.name, fetch)
	];

	try {
		const headers = getCacheHeaders(5);
		const [account_data, delegated, rexbal, rexfund, balances] = await Promise.all(requests);

		// If no response from the light API, add the core liquid balance as a default
		if (!balances.length && chain.systemToken) {
			balances.push({
				contract: chain.systemToken.contract,
				amount: account_data.core_liquid_balance.quantity,
				decimals: account_data.core_liquid_balance.symbol.precision,
				currency: account_data.core_liquid_balance.symbol.code
			});
		}

		return json(
			{
				ts: new Date(),
				account_data,
				balances,
				delegated,
				rex: rexbal,
				rexfund: rexfund
			},
			{ headers }
		);
	} catch (error) {
		console.error(error);
		return json({ error: 'Unable to load account.' }, { status: 500 });
	}
}

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
