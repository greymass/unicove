import {
	API,
	APIClient,
	Asset,
	Checksum256,
	Int128,
	Name,
	UInt64,
	type NameType
} from '@wharfkit/antelope';
import type { REXState } from '@wharfkit/resources';
import { Account, Resource } from '@wharfkit/account';
import { TokenMeta, TokenBalance, TokenIdentifier } from '@wharfkit/common';

import * as SystemContract from '$lib/wharf/contracts/system';
import { type DataSources } from '$lib/types';
import { chainMapper } from '$lib/wharf/chains';
import { NetworkState } from '$lib/state/network.svelte';
import { calculateValue, isSameToken } from '$lib/utils';

const defaultDataSources = {
	get_account: undefined,
	light_account: [],
	delegated: [],
	rex: undefined,
	rexfund: undefined
};

export class AccountState {
	public client?: APIClient = $state();
	public fetch = $state(fetch);

	public network: NetworkState;
	public sources: DataSources = $state(defaultDataSources);

	public account: Account | undefined = $state();
	public name: Name | undefined = $state();
	public last_update: Date = $state(new Date());
	public loaded: boolean = $state(false);

	public balance = $derived.by(() =>
		this.network ? getBalance(this.network, this.sources) : undefined
	);
	public balances = $derived.by(() =>
		this.network
			? getBalances(
					this.network,
					this.sources,
					this.network.chain.id,
					this.network.tokenmeta,
					this.balance?.liquid
				)
			: undefined
	);
	public delegations = $derived(getDelegations(this.sources));
	public cpu = $derived.by(() => (this.account ? this.account.resource('cpu') : undefined));
	public net = $derived.by(() => (this.account ? this.account.resource('net') : undefined));
	public ram = $derived.by(() => (this.account ? this.account.resource('ram') : undefined));
	public permissions = $derived.by(() => (this.account ? this.account.permissions : undefined));
	public value = $derived.by(() => {
		return this.network && this.balance && this.ram
			? getAccountValue(this.network, this.balance, this.ram)
			: undefined;
	});

	constructor(network: NetworkState, name: NameType, fetchOverride?: typeof fetch) {
		if (fetchOverride) {
			this.fetch = fetchOverride;
		}
		this.name = Name.from(name);
		this.network = network;
	}

	static async for(network: NetworkState, name: NameType, fetchOverride?: typeof fetch) {
		const state = new AccountState(network, name, fetchOverride);
		await state.refresh();
		return state;
	}

	async refresh() {
		const response = await this.fetch(
			`/${chainMapper.toShortName(String(this.network.chain.id))}/api/account/${this.name}`
		);
		const json = await response.json();
		this.last_update = new Date();
		this.sources = {
			get_account: json.account_data,
			light_account: json.balances,
			delegated: json.delegated,
			rex: json.rex,
			rexfund: json.rexfund
		};
		this.account = new Account({
			client: this.network.client,
			data: API.v1.AccountObject.from(json.account_data)
		});
		this.loaded = true;
	}

	toJSON() {
		return {
			last_update: this.last_update,
			value: this.value,
			chain: this.network.chain,
			name: this.name,
			balance: this.balance,
			balances: this.balances,
			delegations: this.delegations,
			permissions: this.permissions,
			resources: {
				cpu: this.cpu,
				net: this.net,
				ram: this.ram
			}
		};
	}
}

export interface AccountValue {
	delegated: Asset;
	liquid: Asset;
	ram: Asset;
	staked: Asset;
	total: Asset;
}

export function getAccountValue(
	network: NetworkState,
	balance: Balance,
	ramResources: Resource
): AccountValue {
	const delegated = Asset.from('0.0000 USD');
	const liquid = Asset.from('0.0000 USD');
	const ram = Asset.from('0.0000 USD');
	const staked = Asset.from('0.0000 USD');
	const total = Asset.from('0.0000 USD');

	if (network.tokenprice) {
		delegated.units.add(calculateValue(balance.delegated, network.tokenprice).units);
		liquid.units.add(calculateValue(balance.liquid, network.tokenprice).units);
		staked.units.add(calculateValue(balance.staked, network.tokenprice).units);
		total.units.add(calculateValue(balance.total, network.tokenprice).units);
		if (network.ramprice) {
			const ramAsset = Asset.from(`${ramResources.max.dividing(1000)} RAM`);
			const ramValue = calculateValue(ramAsset, network.ramprice.eos);
			const ramUsdValue = calculateValue(ramValue, network.tokenprice);
			ram.units.add(ramUsdValue.units);
			total.units.add(ramUsdValue.units);
		}
	}

	return {
		delegated,
		liquid,
		ram,
		staked,
		total
	};
}

export interface Balance {
	delegated: Asset;
	liquid: Asset;
	staked: Asset;
	total: Asset;
}

export function getBalance(network: NetworkState, sources: DataSources): Balance {
	if (!network) {
		throw new Error('Network not initialized');
	}
	if (!network.config) {
		throw new Error('Network configuration not initialized');
	}
	// Create an empty balance to start adding to
	const delegated = Asset.fromUnits(0, network.config.symbol);
	const liquid = Asset.fromUnits(0, network.config.symbol);
	const staked = Asset.fromUnits(0, network.config.symbol);
	const total = Asset.fromUnits(0, network.config.symbol);

	if (!sources.get_account) {
		return { delegated, liquid, staked, total };
	}

	// Add the core balance if it exists on the account
	if (sources.get_account.core_liquid_balance) {
		liquid.units.add(Asset.from(sources.get_account.core_liquid_balance).units);
		total.units.add(Asset.from(sources.get_account.core_liquid_balance).units);
	}

	// Add any delegated tokens to the total balance
	if (sources.delegated.length > 0) {
		const delegatedTokens = getDelegated(getDelegations(sources), network.config.symbol);
		delegated.units.add(delegatedTokens.units);
		total.units.add(delegatedTokens.units);
	}

	if (network.config.features.rex) {
		// Add any staked (REX) tokens to total balance based on current value
		if (sources.rex) {
			if (network.rexstate) {
				const rex = network.rexToToken(sources.rex.rex_balance);
				staked.units.add(rex.units);
				total.units.add(rex.units);
			}
		}
		// Add rex fund to total balance based on current value
		if (sources.rexfund && sources.rexfund.balance) {
			staked.units.add(sources.rexfund.balance.units);
			total.units.add(sources.rexfund.balance.units);
		}
	}

	return {
		delegated,
		liquid,
		staked,
		total
	};
}

export function getBalances(
	network: NetworkState,
	sources: DataSources,
	chain: Checksum256,
	tokenmeta?: TokenMeta[],
	liquid?: Asset
): TokenBalance[] {
	if (sources.light_account) {
		const balances: TokenBalance[] = [];

		//If the value of system token is 0,
		//for example, the chain does not support lightapi.
		//replace it with the value of liquid
		sources.light_account?.forEach((lightAccount) => {
			let amount = lightAccount.amount;
			if (
				!Number(amount) &&
				network.chain.systemToken &&
				isSameToken(
					{
						contract: network.chain.systemToken.contract,
						symbol: network.chain.systemToken.symbol.name
					},
					{
						contract: lightAccount.contract,
						symbol: lightAccount.currency
					}
				) &&
				liquid
			) {
				amount = String(liquid.value);
			}
			const asset = Asset.from(`${amount} ${lightAccount.currency}`);
			const contract = Name.from(lightAccount.contract);
			const id = TokenIdentifier.from({
				chain: chain,
				contract: contract,
				symbol: asset.symbol
			});
			const metadata =
				tokenmeta && tokenmeta.length > 0
					? tokenmeta.find((meta) => meta.id.equals(id))
					: undefined;
			balances.push(
				TokenBalance.from({
					asset,
					contract,
					metadata: metadata || TokenMeta.from({ id: { chain, contract, symbol: asset.symbol } })
				})
			);
		});

		return balances;
	}

	return [];
}

export function getDelegated(
	delegations: SystemContract.Types.delegated_bandwidth[],
	symbol: Asset.SymbolType
): Asset {
	const delegatedUnits = delegations.reduce((acc: UInt64, delegation) => {
		acc.add(delegation.net_weight.units);
		acc.add(delegation.cpu_weight.units);
		return acc;
	}, UInt64.from(0));
	return Asset.fromUnits(delegatedUnits, symbol);
}

export function getDelegations(sources: DataSources): SystemContract.Types.delegated_bandwidth[] {
	const { delegated_bandwidth } = SystemContract.Types;
	return sources.delegated.map((delegation) => delegated_bandwidth.from(delegation));
}

export function convertTokenToRex(input: Asset, state: REXState) {
	const asset = Asset.from(input);
	const S1 = state.total_lendable.units.adding(asset.units);
	const R1 = Int128.from(S1)
		.multiplying(state.total_rex.units)
		.dividing(state.total_lendable.units);
	const result = R1.subtracting(state.total_rex.units);
	return Asset.fromUnits(result, state.total_rex.symbol);
}

export function convertRexToToken(input: Asset, state: REXState) {
	const asset = Asset.from(input);
	const R1 = state.total_rex.units.adding(asset.units);
	const S1 = Int128.from(R1)
		.multiplying(state.total_lendable.units)
		.dividing(state.total_rex.units);
	const result = S1.subtracting(state.total_lendable.units);
	return Asset.fromUnits(result, state.total_lendable.symbol);
}
