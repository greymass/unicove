import { API, Int64, Name, Asset, Float64, Checksum256 } from '@wharfkit/antelope';

import { Types as MsigTypes } from '$lib/wharf/contracts/msig';
import { Types as SystemTypes } from '$lib/wharf/contracts/system';
import { Types as UnicoveTypes } from '$lib/wharf/contracts/unicove';
import { Types as REXTypes } from '$lib/types/rex';
import type { LightAPIBalanceRow } from '$lib/types/lightapi';
import type { SerializedNetworkState } from '$lib/types/network';

export interface VoterInfo {
	isProxy: boolean;
	proxyWeight: Float64;
	proxy: Name;
	weight: Float64;
	votes: Name[];
	staked: Int64;
}

export interface AccountDataSources {
	// Native get_account endpoint (deprecated?)
	get_account: API.v1.AccountObject;
	// Hash of the contract on the account
	contract_hash: Checksum256;
	// Light API balances call
	light_api: LightAPIBalanceRow[];
	// Table rows from eosio.token::accounts
	balance: Asset;
	// Table rows from eosio::delband
	delegated: SystemTypes.delegated_bandwidth[];
	// Table row from eosio::giftedram
	giftedram?: UnicoveTypes.gifted_ram;
	// Table rows from eosio.msig::proposal
	proposals: MsigTypes.proposal[];
	// Table rows from eosio::refunds
	refund_request?: SystemTypes.refund_request;
	// Table row from eosio::rexbal
	rexbal?: REXTypes.rex_balance;
	// Table row from eosio::rexfund
	rexfund?: REXTypes.rex_fund;
}

export type AccountResourceType = 'cpu' | 'net' | 'ram';

export interface AccountResource {
	resource: AccountResourceType;
	available: Int64;
	used: Int64;
	max: Int64;
}

export interface AccountResourceCPU extends AccountResource {
	resource: 'cpu';
	current_used: Int64;
}

export interface AccountResourceNET extends AccountResource {
	resource: 'net';
	current_used: Int64;
}

export interface AccountResourceRAM extends AccountResource {
	resource: 'ram';
	gifted: Int64;
	creator: Int64;
	system: Int64;
	balance: Int64;
	owned: Int64;
}

export interface AccountResources {
	cpu: AccountResourceCPU;
	net: AccountResourceNET;
	ram: AccountResourceRAM;
}

export interface SerializedAccountState {
	name: string;
	network: SerializedNetworkState;
	sources: AccountDataSources;
}
