import {
	Struct,
	API,
	Checksum256,
	Int32,
	Int64,
	Name,
	PermissionLevel,
	TimePointSec,
	UInt64,
	UInt128,
	Asset
} from '@wharfkit/antelope';
import type { SampleUsage } from '@wharfkit/resources';

import { Types as DelphioracleTypes } from '$lib/wharf/contracts/delphioracle';
import { Types as MsigTypes } from '$lib/wharf/contracts/msig';
import { Types as SystemTypes } from '$lib/wharf/contracts/system';
import { Types as UnicoveTypes } from '$lib/wharf/contracts/unicove';

export interface Activity {
	actions: ActivityAction[];
	first: Int64;
	last: Int64;
	head_block_num: Int32;
}

@Struct.type('activity_action')
export class ActivityAction extends Struct {
	@Struct.field(Checksum256) declare id: Checksum256;
	@Struct.field(UInt64) declare seq: UInt64;
	@Struct.field(TimePointSec) declare timestamp: TimePointSec;
	@Struct.field(Name) declare contract: Name;
	@Struct.field(Name) declare action: Name;
	@Struct.field(PermissionLevel, { array: true }) declare authorizations: PermissionLevel[];
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	@Struct.field('any') declare data: any;
	@Struct.field(API.v1.OrderedActionsResult) declare raw: API.v1.OrderedActionsResult;
}

export interface ActivityActionWrapper {
	src: ActivityAction;
	id: string;
	shortId: string;
	seqId: string;
	date: string;
	timeInDay: string;
	actionName: string;
	actionStyle: string;
	actionData: string;
}

// TODO: remove and use system contract version once its deployed
// Will be available from here: SystemTypes.gifted_ram
@Struct.type('gifted_ram')
export class gifted_ram extends Struct {
	@Struct.field(Name)
	declare giftee: Name;
	@Struct.field(Name)
	declare gifter: Name;
	@Struct.field(Int64)
	declare ram_bytes: Int64;
}

export interface AccountDataSources {
	// Native get_account endpoint (deprecated?)
	get_account: API.v1.AccountObject;
	// Light API balances call
	light_api: LightAPIBalanceRow[];
	// Table rows from eosio.token::accounts
	balance: Asset;
	// Table rows from eosio::delband
	delegated: SystemTypes.delegated_bandwidth[];
	// Table row from eosio::giftedram
	giftedram?: gifted_ram;
	// Table rows from eosio.msig::proposal
	proposals: MsigTypes.proposal[];
	// Table rows from eosio::refunds
	refund_request: SystemTypes.refund_request;
	// Table row from eosio::rexbal
	rexbal: SystemTypes.rex_balance;
	// Table row from eosio::rexfund
	rexfund: SystemTypes.rex_fund;
}

@Struct.type('sampledusage')
export class SampledUsage extends Struct {
	@Struct.field(API.v1.AccountObject) declare account: API.v1.AccountObject;
	@Struct.field(UInt128) declare cpu: UInt128;
	@Struct.field(UInt128) declare net: UInt128;
}

@Struct.type('networksources')
export class NetworkDataSources extends Struct {
	@Struct.field(SystemTypes.eosio_global_state) declare global: SystemTypes.eosio_global_state;
	@Struct.field(DelphioracleTypes.datapoints, { optional: true })
	declare oracle?: DelphioracleTypes.datapoints;
	@Struct.field(SystemTypes.powerup_state, { optional: true })
	declare powerup?: SystemTypes.powerup_state;
	@Struct.field(SystemTypes.exchange_state) declare ram: SystemTypes.exchange_state;
	@Struct.field(SystemTypes.rex_pool) declare rex: SystemTypes.rex_pool;
	@Struct.field(SampledUsage, { optional: true }) declare sample?: SampledUsage;
	@Struct.field(UnicoveTypes.token_supply) declare token: UnicoveTypes.token_supply;
	@Struct.field(Int64, { optional: true }) declare ram_gift_bytes?: Int64;
}

export interface LightAPIBalanceRow {
	currency: string;
	contract: string;
	amount: string;
	decimals: string;
}

export interface LightAPIBalanceResponse {
	account_name: string;
	balances: LightAPIBalanceRow[];
}

export interface HistoricalPrice {
	date: Date;
	value: Asset;
}
export type DescriptionItem = {
	key: string;
	value: string;
};

export interface NetworkResponse {
	global: SystemTypes.eosio_global_state;
	oracle?: DelphioracleTypes.datapoints;
	powerup?: SystemTypes.powerup_state;
	ram: SystemTypes.exchange_state;
	rex: SystemTypes.rex_pool;
	sample?: SampleUsage;
	token: UnicoveTypes.token_supply;
	ram_gift_bytes?: Int64;
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
