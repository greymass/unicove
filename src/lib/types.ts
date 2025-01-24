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

import * as MsigContract from '$lib/wharf/contracts/msig';
import * as SystemContract from '$lib/wharf/contracts/system';

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

export interface DataSources {
	get_account?: API.v1.AccountObject | undefined;
	light_account: LightAPIBalanceRow[];
	delegated: SystemContract.Types.delegated_bandwidth[];
	proposals: MsigContract.Types.proposal[];
	refund_request: SystemContract.Types.refund_request;
	rexfund?: SystemContract.Types.rex_fund;
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

@Struct.type('sampledusage')
export class SampledUsage extends Struct {
	@Struct.field(API.v1.AccountObject) declare account: API.v1.AccountObject;
	@Struct.field(UInt128) declare cpu: UInt128;
	@Struct.field(UInt128) declare net: UInt128;
}

export interface HistoricalPrice {
	date: Date;
	value: Asset;
}
export type DescriptionItem = {
	key: string;
	value: string;
};
