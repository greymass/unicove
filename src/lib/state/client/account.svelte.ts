import {
	API,
	APIClient,
	Asset,
	Checksum256,
	Float64,
	Int128,
	Int64,
	Name,
	UInt64,
	type NameType
} from '@wharfkit/antelope';
import type { REXState } from '@wharfkit/resources';
import { Account } from '@wharfkit/account';
import { TokenMeta, TokenBalance, TokenIdentifier } from '@wharfkit/common';

import * as SystemContract from '$lib/wharf/contracts/system';
import {
	gifted_ram,
	type AccountDataSources,
	type AccountResourceRAM,
	type AccountResources
} from '$lib/types';
import { NetworkState, type SerializedNetworkState } from '$lib/state/network.svelte';
import { calculateValue, isSameToken } from '$lib/utils';

const defaultDataSources: AccountDataSources = {
	get_account: API.v1.AccountObject.from({
		account_name: '',
		head_block_num: 0,
		head_block_time: '1970-01-01T00:00:00.000',
		privileged: false,
		last_code_update: '1970-01-01T00:00:00.000',
		created: '1970-01-01T00:00:00.000',
		ram_quota: 0,
		net_weight: 0,
		cpu_weight: 0,
		net_limit: {
			used: 0,
			available: 0,
			max: 0,
			last_usage_update_time: '1970-01-01T00:00:00.000',
			current_used: 0
		},
		cpu_limit: {
			used: 0,
			available: 0,
			max: 0,
			last_usage_update_time: '1970-01-01T00:00:00.000',
			current_used: 0
		},
		subjective_cpu_bill_limit: {
			used: 0,
			available: 0,
			max: 0,
			last_usage_update_time: '1970-01-01T00:00:00.000',
			current_used: 0
		},
		ram_usage: 0,
		permissions: [],
		total_resources: {
			owner: '',
			net_weight: '0.0000 EOS',
			cpu_weight: '0.0000 EOS',
			ram_bytes: 0
		}
	}),
	balance: Asset.from('0 '),
	light_api: [],
	delegated: [],
	giftedram: gifted_ram.from({
		gifter: '',
		giftee: '',
		ram_bytes: 0
	}),
	proposals: [],
	refund_request: SystemContract.Types.refund_request.from({
		owner: '',
		request_time: '1970-01-01T00:00:00',
		net_amount: '0 ',
		cpu_amount: '0 '
	}),
	rexbal: SystemContract.Types.rex_balance.from({
		version: 0,
		owner: '',
		vote_stake: '0 ',
		rex_balance: '0 ',
		matured_rex: 0,
		rex_maturities: []
	}),
	rexfund: SystemContract.Types.rex_fund.from({
		version: 0,
		owner: '',
		balance: '0 '
	})
};

interface VoterInfo {
	isProxy: boolean;
	proxyWeight: Float64;
	proxy: Name;
	weight: Float64;
	votes: Name[];
	staked: Int64;
}

const defaultVoteInfo: VoterInfo = {
	isProxy: false,
	proxy: Name.from(''),
	proxyWeight: Float64.from(0),
	weight: Float64.from(0),
	votes: [],
	staked: Int64.from(0)
};

export interface SerializedAccountState {
	name: string;
	network: SerializedNetworkState;
	sources: AccountDataSources;
}

export class AccountState {
	public client?: APIClient = $state();
	public fetch = $state(fetch);

	public network: NetworkState;
	private sources: AccountDataSources = $state(defaultDataSources);

	public account: Account | undefined = $state();
	public name: Name = $state(Name.from(''));
	public last_update: Date = $state(new Date());
	public contract: boolean = $derived(
		Number(new Date(`${this.sources?.get_account?.last_code_update}z`)) > 0
	);
	public loaded: boolean = $state(false);

	public balance = $derived.by(() =>
		this.network ? getBalance(this.network, this.sources) : undefined
	);
	public balances: TokenBalance[] = $derived.by(() =>
		this.network
			? getBalances(
					this.network,
					this.sources,
					this.network.chain.id,
					this.network.tokenmeta,
					this.balance?.liquid
				)
			: []
	);
	public delegations = $derived(getDelegations(this.sources));

	public resources = $derived.by(() => getResources(this.sources, this.network));

	public permissions = $derived.by(() => (this.account ? this.account.permissions : undefined));
	public proposals = $derived.by(() => this.sources.proposals);
	public refundRequest = $derived.by(() => this.sources.refund_request);
	public value = $derived.by(() => {
		return this.network && this.balance && this.resources
			? getAccountValue(this.network, this.balance, this.resources.ram)
			: undefined;
	});
	public voter: VoterInfo = $state(defaultVoteInfo);

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
		const response = await this.fetch(`/${this.network.shortname}/api/account/${this.name}`);
		if (response.ok) {
			const json = await response.json();
			this.setState(json);
		}
	}

	get serialized(): SerializedAccountState {
		return {
			name: String(this.name),
			network: this.network.serialized,
			sources: this.sources
		};
	}

	setState(data: AccountDataSources) {
		this.last_update = new Date();
		this.sources = {
			get_account: data.get_account,
			balance: data.balance,
			giftedram: data.giftedram,
			light_api: data.light_api,
			delegated: data.delegated,
			proposals: data.proposals,
			refund_request: data.refund_request,
			rexbal: data.rexbal,
			rexfund: data.rexfund
		};
		this.account = new Account({
			client: this.network.client,
			data: API.v1.AccountObject.from(this.sources.get_account)
		});
		if (data.get_account && data.get_account.voter_info) {
			this.voter = {
				isProxy: data.get_account.voter_info.is_proxy,
				proxy: Name.from(data.get_account.voter_info.proxy),
				proxyWeight: Float64.from(data.get_account.voter_info.proxied_vote_weight),
				weight: Float64.from(data.get_account.voter_info.last_vote_weight),
				votes: data.get_account.voter_info.producers.map((producer: NameType) =>
					Name.from(producer)
				),
				staked: Int64.from(data.get_account.voter_info.staked)
			};
		}
		this.loaded = true;
	}

	toJSON() {
		return {
			last_update: this.last_update,
			value: this.value,
			chain: this.network.chain,
			contract: this.contract,
			name: this.name,
			balance: this.balance,
			balances: this.balances,
			delegations: this.delegations,
			permissions: this.permissions,
			proposals: this.proposals,
			resources: this.resources,
			voter: this.voter
		};
	}
}

export function getResources(
	sources: AccountDataSources,
	network?: NetworkState
): AccountResources {
	// Original API values
	const quota = Int64.from(sources.get_account.ram_quota);
	const usage = Int64.from(sources.get_account.ram_usage);
	const available = quota.subtracting(usage);

	// A gifted balance from another account (such as the creator)
	const creator = Int64.from(sources.giftedram ? sources.giftedram.ram_bytes : 0);

	// A gifted balance from the system (typically 1400 bytes)
	const system = Int64.from(network ? network.resources.ram.gift : 0);

	// Total gifted balance
	const gifted = creator.adding(system);

	// The amount of RAM this account owns, for value calculation
	const owned = Int64.from(quota.subtracting(gifted));

	// Calculate RAM (Asset) balance
	const balance = Int64.from(0);

	// The amount of RAM that can be traded/transferred
	const giftAvailable = gifted.subtracting(usage);
	if (giftAvailable.gt(Int64.from(0))) {
		balance.add(available.subtracting(giftAvailable));
	} else {
		balance.add(available);
	}

	return {
		cpu: {
			resource: 'cpu',
			available: Int64.from(sources.get_account.cpu_limit.available),
			used: Int64.from(sources.get_account.cpu_limit.used),
			max: Int64.from(sources.get_account.cpu_limit.max),
			current_used: Int64.from(sources.get_account.cpu_limit.current_used)
		},
		net: {
			resource: 'net',
			available: Int64.from(sources.get_account.net_limit.available),
			used: Int64.from(sources.get_account.net_limit.used),
			max: Int64.from(sources.get_account.net_limit.max),
			current_used: Int64.from(sources.get_account.net_limit.current_used)
		},
		ram: {
			resource: 'ram',
			available,
			balance,
			used: usage,
			max: quota,
			gifted,
			creator,
			system,
			owned
		}
	};
}

export interface AccountValue {
	delegated: Asset;
	liquid: Asset;
	ram: Asset;
	refunding: Asset;
	staked: Asset;
	systemtoken: Asset;
	total: Asset;
	unstaked: Asset;
}

export function getAccountValue(
	network: NetworkState,
	balance: Balance,
	ramResources: AccountResourceRAM
): AccountValue {
	const delegated = Asset.from('0.0000 USD');
	const liquid = Asset.from('0.0000 USD');
	const ram = Asset.from('0.0000 USD');
	const refunding = Asset.from('0.0000 USD');
	const staked = Asset.from('0.0000 USD');
	const unstaked = Asset.from('0.0000 USD');
	const systemtoken = Asset.from('0.0000 USD');
	const total = Asset.from('0.0000 USD');

	if (network.token.price.units.gt(UInt64.from(0))) {
		delegated.units.add(calculateValue(balance.delegated, network.token.price).units);
		liquid.units.add(calculateValue(balance.liquid, network.token.price).units);
		staked.units.add(calculateValue(balance.staked, network.token.price).units);
		refunding.units.add(calculateValue(balance.refunding, network.token.price).units);
		unstaked.units.add(calculateValue(balance.unstaked, network.token.price).units);
		systemtoken.units.add(calculateValue(balance.total, network.token.price).units);
		total.units.add(calculateValue(balance.total, network.token.price).units);
		if (network.resources.ram.price.rammarket) {
			const ramAsset = Asset.fromUnits(ramResources.owned, '3,KB');
			const ramValue = calculateValue(ramAsset, network.resources.ram.price.rammarket);
			const ramUsdValue = calculateValue(ramValue, network.token.price);
			ram.units.add(ramUsdValue.units);
			total.units.add(ramUsdValue.units);
		}
	}

	return {
		delegated,
		liquid,
		ram,
		refunding,
		staked,
		unstaked,
		systemtoken,
		total
	};
}

export interface Balance {
	// Tokens delegated from genesis or the old eosio::delegatebw action
	delegated: Asset;
	// Available token balance for the account on eosio.token
	liquid: Asset;
	// Tokens being refunded from delegated balances, claimable with eosio::refund
	refunding: Asset;
	// REX balance represented as staked system tokens
	staked: Asset;
	// System tokens idle in the eosio.rex contract (likely from eosio::sellrex)
	unstaked: Asset;
	// Total balance of all owned system tokens
	total: Asset;
}

export function getBalance(network: NetworkState, sources: AccountDataSources): Balance {
	if (!network) {
		throw new Error('Network not initialized');
	}
	if (!network.config) {
		throw new Error('Network configuration not initialized');
	}
	// Create an empty balance to start adding to
	const delegated = Asset.fromUnits(0, network.config.systemtoken.symbol);
	const refunding = Asset.fromUnits(0, network.config.systemtoken.symbol);
	const liquid = Asset.fromUnits(0, network.config.systemtoken.symbol);
	const staked = Asset.fromUnits(0, network.config.systemtoken.symbol);
	const unstaked = Asset.fromUnits(0, network.config.systemtoken.symbol);
	const total = Asset.fromUnits(0, network.config.systemtoken.symbol);

	// Add the core balance if it exists on the account
	if (sources.balance) {
		const balance = Asset.from(sources.balance);
		liquid.units.add(balance.units);
		total.units.add(balance.units);
	}

	// Add any delegated tokens to the total balance
	if (sources.delegated.length > 0) {
		const delegatedTokens = getDelegated(
			getDelegations(sources),
			network.config.systemtoken.symbol
		);
		delegated.units.add(delegatedTokens.units);
		total.units.add(delegatedTokens.units);
	}

	// Add the currently refunding balance to the total balance
	if (sources.refund_request) {
		const cpu = Asset.from(sources.refund_request.cpu_amount);
		refunding.units.add(cpu.units);
		total.units.add(cpu.units);
		const net = Asset.from(sources.refund_request.net_amount);
		refunding.units.add(net.units);
		total.units.add(net.units);
	}

	if (network.config.features.rex) {
		// Add any staked (REX) tokens to total balance based on current value
		if (sources.rexbal) {
			if (network.supports('rex')) {
				const rex = network.rexToToken(sources.rexbal.rex_balance);
				staked.units.add(rex.units);
				total.units.add(rex.units);
			}
		}
		// Add rex fund to total balance based on current value
		if (sources.rexfund && sources.rexfund.balance) {
			const balance = Asset.from(sources.rexfund.balance);
			unstaked.units.add(balance.units);
			total.units.add(balance.units);
		}
	}

	return {
		delegated,
		liquid,
		refunding,
		staked,
		unstaked,
		total
	};
}

export function getBalances(
	network: NetworkState,
	sources: AccountDataSources,
	chain: Checksum256,
	tokenmeta?: TokenMeta[],
	liquid?: Asset
): TokenBalance[] {
	if (sources.light_api) {
		const balances: TokenBalance[] = [];

		//If the value of system token is 0,
		//for example, the chain does not support lightapi.
		//replace it with the value of liquid
		sources.light_api?.forEach((balance) => {
			let amount = balance.amount;
			if (
				!Number(amount) &&
				network.chain.systemToken &&
				isSameToken(
					{
						contract: network.chain.systemToken.contract,
						symbol: network.chain.systemToken.symbol.name
					},
					{
						contract: balance.contract,
						symbol: balance.currency
					}
				) &&
				liquid
			) {
				amount = liquid.quantity;
			}
			const asset = Asset.from(`${amount} ${balance.currency}`);
			const contract = Name.from(balance.contract);
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

		// Sort balances alphabetically
		balances.sort((a, b) => {
			if (a.asset.symbol.name < b.asset.symbol.name) {
				return -1;
			}
			if (a.asset.symbol.name > b.asset.symbol.name) {
				return 1;
			}
			return 0;
		});

		// Move system token to the top of the list regardless of alphabetical order
		balances.sort((a, b) => {
			if (
				a.contract.equals(network.token.definition.contract) &&
				a.asset.symbol.equals(network.token.definition.symbol)
			) {
				return -1;
			}
			if (
				b.contract.equals(network.token.definition.contract) &&
				b.asset.symbol.equals(network.token.definition.symbol)
			) {
				return 1;
			}
			return 0;
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

export function getDelegations(
	sources: AccountDataSources
): SystemContract.Types.delegated_bandwidth[] {
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
