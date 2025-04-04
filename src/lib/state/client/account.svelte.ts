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

import type { NetworkState } from '$lib/state/network.svelte';
import type {
	AccountDataSources,
	AccountResources,
	SerializedAccountState,
	VoterInfo
} from '$lib/types/account';

import {
	defaultAccountDataSources,
	defaultVoteInfo,
	nullContractHash
} from '$lib/state/defaults/account';
import * as SystemContract from '$lib/wharf/contracts/system';
import { Types as REXTypes } from '$lib/types/rex';
import { TokenBalance, TokenDefinition } from '$lib/types/token';

export class AccountState {
	public client?: APIClient = $state();
	public fetch = $state(fetch);

	public network: NetworkState;
	private sources: AccountDataSources = $state(defaultAccountDataSources);

	public name: Name = $state(Name.from(''));
	public last_update: Date = $state(new Date());
	public contract: boolean = $derived(!this.sources.contract_hash.equals(nullContractHash));
	public loaded: boolean = $state(false);

	public balance = $derived.by(() => getBalance(this.network, this.sources));
	public balances = $derived.by(() => getBalances(this.network, this.sources, this.resources));

	public delegations = $derived(getDelegations(this.sources));
	public resources = $derived.by(() => getResources(this.sources, this.network));
	public rex = $derived.by(() => getRex(this.sources));
	public permissions = $derived(API.v1.AccountObject.from(this.sources.get_account).permissions);
	public proposals = $derived.by(() => this.sources.proposals);
	public refundRequest = $derived.by(() => this.sources.refund_request);
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
		if (!response.ok) {
			throw new Error(
				`Failed to fetch account data for ${this.name} on ${this.network.chain.name}`
			);
		}
		const json = await response.json();
		this.setState(json);
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
			contract_hash: Checksum256.from(data.contract_hash),
			balance: data.balance,
			balances: data.balances,
			giftedram: data.giftedram,
			delegated: data.delegated,
			proposals: data.proposals,
			refund_request: data.refund_request,
			rexbal: data.rexbal,
			rexfund: data.rexfund
		};
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

	getSources() {
		return this.sources;
	}

	toJSON() {
		return {
			last_update: this.last_update,
			// value: this.value,
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

export function getRex(sources: AccountDataSources) {
	if (!sources.rexbal) {
		return defaultAccountDataSources.rexbal;
	}
	return REXTypes.rex_balance.from(sources.rexbal);
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
	// Value of tokens delegated during genesis or the old eosio::delegatebw action
	delegated: Asset;
	// Available token balance for the account on the token contract
	liquid: Asset;
	// Value of RAM owned by the account
	ram: Asset;
	// Tokens being refunded from delegated balances, claimable with eosio::refund
	refunding: Asset;
	// Value of REX balance represented as staked system tokens
	staked: Asset;
	// Sum value of the system token values (minus RAM)
	systemtoken: Asset;
	// Sum of all values
	total: Asset;
	// Value of all non-system tokens owned by the account
	tokens: Asset;
	// System tokens idle in the eosio.rex contract (likely from eosio::sellrex)
	unstaked: Asset;
}

export function getBalance(network: NetworkState, sources: AccountDataSources): TokenBalance {
	if (!network) {
		throw new Error('Network not initialized');
	}
	if (!network.config) {
		throw new Error('Network configuration not initialized');
	}

	const total = Asset.fromUnits(0, network.config.systemtoken.symbol);
	const liquid = Asset.fromUnits(0, network.config.systemtoken.symbol);
	if (sources.balance) {
		const balance = Asset.from(sources.balance);
		liquid.units.add(balance.units);
		total.units.add(balance.units);
	}

	const delegated = Asset.fromUnits(0, network.config.systemtoken.symbol);
	if (sources.delegated.length > 0) {
		const delegatedTokens = getDelegated(
			getDelegations(sources),
			network.config.systemtoken.symbol
		);
		delegated.units.add(delegatedTokens.units);
		total.units.add(delegatedTokens.units);
	}

	let legacy = Asset.fromUnits(0, network.config.systemtoken.symbol);
	if (network.legacytoken) {
		const legacyDefinition = TokenDefinition.from(network.legacytoken);
		const legacyBalance = sources.balances.find((b) => {
			return TokenBalance.from(b).id.equals(legacyDefinition);
		});
		if (legacyBalance) {
			const legacyAsset = Asset.from(legacyBalance.balance);
			legacy = legacyAsset;
		}
	}

	const refunding = Asset.fromUnits(0, network.config.systemtoken.symbol);
	if (sources.refund_request) {
		const cpu = Asset.from(sources.refund_request.cpu_amount);
		refunding.units.add(cpu.units);
		total.units.add(cpu.units);
		const net = Asset.from(sources.refund_request.net_amount);
		refunding.units.add(net.units);
		total.units.add(net.units);
	}

	const staked = Asset.fromUnits(0, network.config.systemtoken.symbol);
	const unstaked = Asset.fromUnits(0, network.config.systemtoken.symbol);
	if (network.supports('rex')) {
		if (sources.rexbal) {
			const rex = network.rexToToken(sources.rexbal.rex_balance);
			staked.units.add(rex.units);
			total.units.add(rex.units);
		}
		if (sources.rexfund && sources.rexfund.balance) {
			const balance = Asset.from(sources.rexfund.balance);
			unstaked.units.add(balance.units);
			total.units.add(balance.units);
		}
	}

	const children = [
		{
			name: 'delegated',
			id: network.token.id,
			balance: delegated
		},
		{
			name: 'refunding',
			id: network.token.id,
			balance: refunding
		},
		{
			name: 'staked',
			id: network.token.id,
			balance: staked
		},
		{
			name: 'total',
			id: network.token.id,
			balance: total
		},
		{
			name: 'unstaked',
			id: network.token.id,
			balance: unstaked
		}
	];

	if (network.legacytoken) {
		children.push({
			name: 'legacy',
			id: network.token.id,
			balance: legacy
		});
	}

	return TokenBalance.from({
		id: network.token.id,
		balance: liquid,
		children
	});
}

export function getBalances(
	network: NetworkState,
	sources: AccountDataSources,
	resources: AccountResources
): TokenBalance[] {
	const balances: TokenBalance[] = sources.balances.map((b) => TokenBalance.from(b));
	const id = network.getRamTokenDefinition();
	balances.push(
		TokenBalance.from({
			id,
			balance: Asset.fromUnits(resources.ram.available, id.symbol),
			locked: !network.supports('ramtransfer'),
			children: [
				{
					id,
					balance: Asset.fromUnits(resources.ram.used, id.symbol),
					name: 'used'
				},
				{
					id,
					balance: Asset.fromUnits(resources.ram.owned, id.symbol),
					name: 'total'
				}
			]
		})
	);

	// Sort balances alphabetically
	balances.sort((a, b) => {
		if (a.id.symbol.name < b.id.symbol.name) {
			return -1;
		}
		if (a.id.symbol.name > b.id.symbol.name) {
			return 1;
		}
		return 0;
	});

	// Move system token to the top of the list regardless of alphabetical order
	balances.sort((a, b) => {
		if (a.id.equals(network.token.id)) {
			return -1;
		}
		if (b.id.equals(network.token.id)) {
			return 1;
		}
		return 0;
	});

	return balances;
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
