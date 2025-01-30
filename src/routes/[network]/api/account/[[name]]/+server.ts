import { json } from '@sveltejs/kit';
import { Asset, type NameType } from '@wharfkit/antelope';
import type { ChainDefinition } from '@wharfkit/common';

import { getChainDefinitionFromParams, NetworkState } from '$lib/state/network.svelte';
import { getBackendNetwork, getLightAPIURL } from '$lib/wharf/client/ssr';
import { getCacheHeaders } from '$lib/utils';
import type { LightAPIBalanceResponse, LightAPIBalanceRow } from '$lib/types.js';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ fetch, params }) => {
	const chain = getChainDefinitionFromParams(params.network);

	if (!chain) {
		return json({ error: 'Invalid chain specified' }, { status: 400 });
	}

	if (!params.name) {
		return json({ error: 'Account name not specified.' }, { status: 500 });
	}

	const network = getBackendNetwork(chain, fetch);
	const headers = getCacheHeaders(5);

	try {
		let response;
		if (network.supports('unicovecontracts')) {
			response = await getAccount2(network, params.name, chain);
		} else {
			response = await getAccount(network, params.name, chain);
		}
		return json(
			{
				ts: new Date(),
				...response
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
		const result = await f(
			`${getLightAPIURL(network.shortname)}/api/balances/${network}/${account}`
		);
		const json: LightAPIBalanceResponse = await result.json();
		balances.push(...json.balances);
	}
	return balances;
}

async function getAccount(network: NetworkState, account: NameType, chain: ChainDefinition) {
	const { system: systemContract, msig: msigContract } = network.contracts;

	const [get_account, delegated, proposals] = await Promise.all([
		network.client.v1.chain.get_account(account),
		systemContract.table('delband').all({ scope: account }),
		msigContract.table('proposal', account).all()
	]);

	let rexfund;
	let balances: LightAPIBalanceRow[] = [];

	if (network.supports('lightapi')) {
		balances = await loadBalances(network, account, fetch);
	}

	if (network.supports('rex')) {
		rexfund = await systemContract.table('rexfund').get(account);
	}

	// If no response from the light API, add a default balance of zero
	if (!balances.length && chain.systemToken) {
		const symbol = Asset.Symbol.from(network.config.symbol);
		balances.push({
			contract: String(chain.systemToken.contract),
			amount: '0',
			decimals: String(symbol.precision),
			currency: String(symbol.code)
		});
	}

	return {
		get_account,
		balance: get_account.core_liquid_balance,
		balances,
		delegated,
		proposals,
		refund_request: get_account.refund_request,
		rexbal: get_account.rex_info,
		rexfund
	};
}

async function getAccount2(network: NetworkState, account: NameType, chain: ChainDefinition) {
	const [get_account, getaccount] = await Promise.all([
		network.client.v1.chain.get_account(account),
		network.contracts.unicove.readonly('account', { account })
	]);

	let balances: LightAPIBalanceRow[] = [];

	if (network.supports('lightapi')) {
		balances = await loadBalances(network, account, fetch);
	}

	// If no response from the light API, add a default balance of zero
	if (!balances.length && chain.systemToken) {
		const symbol = Asset.Symbol.from(network.config.symbol);
		balances.push({
			contract: String(chain.systemToken.contract),
			amount: '0',
			decimals: String(symbol.precision),
			currency: String(symbol.code)
		});
	}

	return {
		get_account,
		balance: getaccount.balance,
		balances,
		delegated: getaccount.delegations,
		proposals: getaccount.proposals,
		refund_request: getaccount.refund,
		rexbal: getaccount.rexbal,
		rexfund: getaccount.rexfund
	};
}
