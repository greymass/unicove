import {
	Struct,
	API,
	Checksum256,
	Int32,
	Int64,
	TimePointSec,
	UInt64,
	UInt128,
	APIClient,
	Asset,
	Action
} from '@wharfkit/antelope';

import { Types as DelphioracleTypes } from '$lib/wharf/contracts/delphioracle';
import { Types as SystemTypes } from '$lib/wharf/contracts/system';
import { Types as UnicoveTypes } from '$lib/wharf/contracts/unicove';
import type { ChainConfig } from '$lib/wharf/chains';

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

export interface Activity {
	actions: ActivityAction[];
	first: Int64;
	last: Int64;
	head_block_num: Int32;
}

@Struct.type('activity_action')
export class ActivityAction extends Action {
	@Struct.field(Checksum256) declare id: Checksum256;
	@Struct.field(UInt64) declare seq: UInt64;
	@Struct.field(TimePointSec) declare timestamp: TimePointSec;
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

export interface NetworkStateOptions {
	fetch?: typeof fetch;
	client?: APIClient;
}

export interface SystemResourceCPUNET {
	price: SystemResourceSourcesCPUNET;
}

export interface SystemResourceRAM {
	price: SystemResourceSourcesRAM;
	supply: UInt64;
	gift: UInt64;
}

export interface SystemResources {
	cpu: SystemResourceCPUNET;
	net: SystemResourceCPUNET;
	ram: SystemResourceRAM;
}

export interface SystemResourceSourcesCPUNET {
	powerup: Asset;
	rex: Asset;
	staking: Asset;
}

export interface SystemResourceSourcesRAM {
	rammarket: Asset;
}

export interface ChainConnectionState {
	connected: boolean;
	endpoint: string;
	updated: Date;
}

export interface SerializedNetworkState {
	config: ChainConfig;
	sources?: NetworkDataSources;
}
