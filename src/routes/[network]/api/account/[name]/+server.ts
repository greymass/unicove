import { json } from '@sveltejs/kit';
import { Asset, type NameType } from '@wharfkit/antelope';

import { NetworkState } from '$lib/state/network.svelte';
import { getCacheHeaders } from '$lib/utils';
import type { AccountDataSources } from '$lib/types/account';
import type { LightAPIBalanceResponse, LightAPIBalanceRow } from '$lib/types/lightapi';

import type { RequestEvent, RequestHandler } from './$types';

import { Types as SystemTypes } from '$lib/wharf/contracts/system';

export const GET: RequestHandler = async ({ locals: { network }, params }: RequestEvent) => {
	const headers = getCacheHeaders(5);

	try {
		let response: AccountDataSources;
		if (network.supports('unicovecontracts')) {
			try {
				response = await getAccount2(network, params.name);
			} catch (e) {
				// Fallback to old method on failure
				console.error('getAccount2 failure', e);
				response = await getAccount(network, params.name);
			}
		} else {
			response = await getAccount(network, params.name);
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
	if (network.supports('lightapi') && network.config.endpoints.lightapi) {
		const result = await f(
			`${network.config.endpoints.lightapi}/api/balances/${network}/${account}`
		);
		const json: LightAPIBalanceResponse = await result.json();
		balances.push(...json.balances);
	}
	return balances;
}

async function getAccount(network: NetworkState, account: NameType): Promise<AccountDataSources> {
	const { system: systemContract, msig: msigContract } = network.contracts;

	const [get_account, delegated, proposals] = await Promise.all([
		network.client.v1.chain.get_account(account),
		systemContract.table('delband').all({ scope: account }),
		msigContract.table('proposal', account).all()
	]);

	let rex;
	let balances: LightAPIBalanceRow[] = [];
	let giftedram;

	if (network.supports('lightapi')) {
		balances = await loadBalances(network, account, network.fetch);
	}

	if (network.supports('rex')) {
		rex = await systemContract.table('rexfund').get(account);
	}

	if (network.supports('giftedram')) {
		giftedram = await systemContract.table('giftedram').get(account);
	}

	// If no response from the light API, add a default balance of zero
	if (!balances.length && network.chain.systemToken) {
		const symbol = Asset.Symbol.from(network.config.systemtoken.symbol);
		balances.push({
			contract: String(network.chain.systemToken.contract),
			amount: '0',
			decimals: String(symbol.precision),
			currency: String(symbol.code)
		});
	}

	const defaultBalance = Asset.fromUnits(0, network.config.systemtoken.symbol);

	let refund_request: SystemTypes.refund_request | undefined;
	if (get_account.refund_request) {
		refund_request = SystemTypes.refund_request.from(get_account.refund_request);
	}

	let rexbal: SystemTypes.rex_balance | undefined;
	if (get_account.rex_info) {
		rexbal = SystemTypes.rex_balance.from(get_account.rex_info);
	}

	let rexfund: SystemTypes.rex_fund | undefined;
	if (rex) {
		rexfund = SystemTypes.rex_fund.from(rex);
	}

	return {
		get_account,
		balance: get_account.core_liquid_balance || defaultBalance,
		light_api: balances,
		delegated,
		giftedram,
		proposals,
		refund_request,
		rexbal,
		rexfund
	};
}

async function getAccount2(network: NetworkState, account: NameType): Promise<AccountDataSources> {
	const [get_account, getaccount] = await Promise.all([
		network.client.v1.chain.get_account(account),
		network.contracts.unicove.readonly('account', { account })
	]);

	let balances: LightAPIBalanceRow[] = [];

	if (network.supports('lightapi')) {
		balances = await loadBalances(network, account, network.fetch);
	}

	// If no response from the light API, add a default balance of zero
	if (!balances.length && network.chain.systemToken) {
		const symbol = Asset.Symbol.from(network.config.systemtoken.symbol);
		balances.push({
			contract: String(network.chain.systemToken.contract),
			amount: '0',
			decimals: String(symbol.precision),
			currency: String(symbol.code)
		});
	}

	return {
		get_account,
		balance: getaccount.balance,
		light_api: balances,
		delegated: getaccount.delegations,
		giftedram: getaccount.giftedram,
		proposals: getaccount.proposals,
		refund_request: getaccount.refund,
		rexbal: getaccount.rexbal,
		rexfund: getaccount.rexfund
	};
}
