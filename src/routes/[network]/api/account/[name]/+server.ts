import { json } from '@sveltejs/kit';
import { Asset, Serializer, type NameType } from '@wharfkit/antelope';

import { NetworkState } from '$lib/state/network.svelte';
import { getCacheHeaders } from '$lib/utils';
import type { AccountDataSources } from '$lib/types/account';
import type { LightAPIBalanceResponse } from '$lib/types/lightapi';

import type { RequestEvent, RequestHandler } from './$types';

import { Types as SystemTypes, type TableTypes } from '$lib/wharf/contracts/system';
import { Types as REXTypes } from '$lib/types/rex';
import { Types as RegistryTypes } from '$lib/wharf/contracts/registry';
import { Types as UnicoveTypes } from '$lib/wharf/contracts/unicove.api';
import {
	defaultGiftedRam,
	defaultRefundRequest,
	defaultRexBalance,
	defaultRexFund,
	nullContractHash
} from '$lib/state/defaults/account';
import { TokenBalance, TokenDefinition, tokenEquals } from '$lib/types/token';
import { PUBLIC_FEATURE_UNICOVE_CONTRACT_API_TOKENS } from '$env/static/public';

export const GET: RequestHandler = async ({ fetch, locals: { network }, params }: RequestEvent) => {
	const headers = getCacheHeaders(5);

	try {
		let response: AccountDataSources;
		if (network.supports('unicovecontractapi')) {
			try {
				let tokens: UnicoveTypes.token_definition[] = [];
				if (network.supports('registry')) {
					const registryTokens = await fetch(`/${network}/api/registry/tokens`);
					if (registryTokens.ok) {
						const json = await registryTokens.json();
						tokens = json.tokens.map((t: RegistryTypes.token_row) =>
							UnicoveTypes.token_definition.from({
								chain: network.chain.id,
								contract: t.contract,
								symbol: Asset.Symbol.from(`0,${t.ticker}`)
							})
						);
					}
				}
				response = await getAccount2(network, params.name, tokens);
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
): Promise<TokenBalance[]> {
	let balances: TokenBalance[] = [];
	if (network.supports('lightapi') && network.config.endpoints.lightapi) {
		// TODO: Remove this when the lightapi supports pathing to /vaulta URLs
		let shortname = String(network);
		if (shortname === 'vaulta') {
			// Force /vaulta to /eos in URLs for the lightapi
			shortname = 'eos';
		}
		const result = await f(
			`${network.config.endpoints.lightapi}/api/balances/${shortname}/${account}`
		);
		const json: LightAPIBalanceResponse = await result.json();
		balances = json.balances.map((b) => {
			let token = network.getToken(
				TokenDefinition.from({
					chain: network.chain.id,
					contract: b.contract,
					symbol: `${b.decimals},${b.currency}`
				})
			);
			if (
				network.config.legacytoken &&
				tokenEquals(TokenDefinition.from(token.id), network.config.legacytoken.id)
			) {
				token = network.config.legacytoken;
			} else if (tokenEquals(TokenDefinition.from(token.id), network.token.id)) {
				token = network.token;
			}

			return TokenBalance.from({
				token,
				balance: Asset.fromFloat(Number(b.amount), `${b.decimals},${b.currency}`)
			});
		});
	}
	return balances;
}

async function getAccount(network: NetworkState, account: NameType): Promise<AccountDataSources> {
	const { system: systemContract, msig: msigContract } = network.contracts;

	const [get_account, delegated, proposals, hash] = await Promise.all([
		network.client.v1.chain.get_account(account),
		systemContract.table('delband').all({ scope: account }),
		msigContract.table('proposal', account).all(),
		systemContract.table('abihash').get(account)
	]);

	let rex;
	let balances: TokenBalance[] = [];
	let giftedram = defaultGiftedRam;

	if (network.supports('lightapi')) {
		balances = await loadBalances(network, account, network.fetch);
	} else {
		balances = [
			TokenBalance.from({
				token: network.token,
				balance: get_account.core_liquid_balance || Asset.fromUnits(0, network.token.symbol)
			})
		];
	}

	if (network.supports('rex')) {
		rex = await systemContract.table('rexfund' as keyof TableTypes).get(account);
	}

	if (network.supports('giftedram')) {
		// Had to overridde type safety because this table doesn't always exist.
		giftedram = (await systemContract
			.table('giftedram' as keyof TableTypes)
			.get(account)) as unknown as UnicoveTypes.gifted_ram;
	}

	const defaultBalance = Asset.fromUnits(0, network.config.systemtoken.symbol);

	let refund_request = defaultRefundRequest;
	if (get_account.refund_request) {
		refund_request = SystemTypes.refund_request.from(get_account.refund_request);
	}

	let rexbal = defaultRexBalance;
	if (get_account.rex_info) {
		rexbal = REXTypes.rex_balance.from(get_account.rex_info);
	}

	let rexfund = defaultRexFund;
	if (rex) {
		rexfund = REXTypes.rex_fund.from(rex);
	}

	const contract_hash = hash?.hash || nullContractHash;

	return {
		get_account,
		contract_hash,
		balance: TokenBalance.from({
			token: network.token,
			balance: get_account.core_liquid_balance || defaultBalance
		}),
		balances,
		delegated,
		giftedram,
		proposals,
		refund_request,
		rexbal,
		rexfund
	};
}

async function getAccount2(
	network: NetworkState,
	account: NameType,
	tokens: UnicoveTypes.token_definition[] = []
): Promise<AccountDataSources> {
	if (!tokens.length && PUBLIC_FEATURE_UNICOVE_CONTRACT_API_TOKENS) {
		tokens = Serializer.decode({
			type: 'token_definition[]',
			customTypes: [TokenDefinition],
			data: PUBLIC_FEATURE_UNICOVE_CONTRACT_API_TOKENS
		}) as UnicoveTypes.token_definition[];
	}
	const [get_account, getaccount] = await Promise.all([
		network.client.v1.chain.get_account(account),
		network.contracts.unicove.readonly('account', { account, tokens })
	]);

	const balances = await getBalances(network, tokens, getaccount);

	return {
		get_account,
		contract_hash: getaccount.contracthash,
		balance: TokenBalance.from(getaccount.balance),
		balances,
		delegated: getaccount.delegations,
		giftedram: getaccount.giftedram,
		proposals: getaccount.proposals,
		refund_request: getaccount.refund,
		rexbal: getaccount.rexbal,
		rexfund: getaccount.rexfund
	};
}

async function getBalances(
	network: NetworkState,
	requested: UnicoveTypes.token_definition[],
	getaccount: UnicoveTypes.get_account_response
): Promise<TokenBalance[]> {
	const balances: TokenBalance[] = [];
	if (network.supports('lightapi')) {
		const results = await loadBalances(network, getaccount.account, network.fetch);
		balances.push(...results);
	} else if (getaccount.balance) {
		balances.push(
			TokenBalance.from({
				token: network.getSystemToken(),
				balance: getaccount.balance.balance
			})
		);
	}
	if (getaccount.balances) {
		for (const requestedToken of requested) {
			const balance = getaccount.balances.find((b) =>
				b.token.id.symbol.equals(requestedToken.symbol)
			);
			if (balance) {
				// If this is the legacy token, merge in configured token metadata
				if (
					network.config.legacytoken &&
					tokenEquals(TokenDefinition.from(balance.token.id), network.config.legacytoken.id)
				) {
					balances.push(
						TokenBalance.from({
							...balance,
							token: network.config.legacytoken
						})
					);
				} else if (tokenEquals(TokenDefinition.from(balance.token.id), network.token.id)) {
					// If this is the system token, merge in configured token metadata
					balances.push(
						TokenBalance.from({
							...balance,
							token: network.token
						})
					);
				} else {
					balances.push(
						TokenBalance.from({
							...balance
						})
					);
				}
			}
		}
	}
	return balances;
}
