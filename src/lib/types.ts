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

import * as MsigContract from '$lib/wharf/contracts/msig';
import * as SystemContract from '$lib/wharf/contracts/system';

import { Types as DelphioracleTypes } from '$lib/wharf/contracts/delphioracle';
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

export interface AccountDataSources {
	// Native get_account endpoint (deprecated?)
	get_account?: API.v1.AccountObject | undefined;
	// Light API balances call
	light_account: LightAPIBalanceRow[];
	// Table rows from eosio.token::accounts
	balance: Asset;
	// Table rows from eosio::delband
	delegated: SystemContract.Types.delegated_bandwidth[];
	// Table rows from eosio.msig::proposal
	proposals: MsigContract.Types.proposal[];
	// Table rows from eosio::refunds
	refund_request: SystemContract.Types.refund_request;
	// Table row from eosio::rexbal
	rexbal: SystemContract.Types.rex_balance;
	// Table row from eosio::rexfund
	rexfund: SystemContract.Types.rex_fund;
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
	@Struct.field(SystemTypes.powerup_state) declare powerup: SystemTypes.powerup_state;
	@Struct.field(SystemTypes.exchange_state) declare ram: SystemTypes.exchange_state;
	@Struct.field(SystemTypes.rex_pool) declare rex: SystemTypes.rex_pool;
	@Struct.field(SampledUsage, { optional: true }) declare sample?: SampledUsage;
	@Struct.field(UnicoveTypes.token_supply) declare token: UnicoveTypes.token_supply;
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
	powerup: SystemTypes.powerup_state;
	ram: SystemTypes.exchange_state;
	rex: SystemTypes.rex_pool;
	sample?: SampleUsage;
	token: UnicoveTypes.token_supply;
}
