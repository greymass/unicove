import {
	Struct,
	API,
	Checksum256,
	Int32,
	Int64,
	Name,
	PermissionLevel,
	TimePointSec,
	UInt64
} from '@wharfkit/antelope';

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
	@Struct.field('any') declare data: any;
	@Struct.field(API.v1.OrderedActionsResult) declare raw: API.v1.OrderedActionsResult;
}

export interface DataSources {
	get_account?: API.v1.AccountObject | undefined;
	light_account: LightAPIBalanceResponse[];
	delegated: SystemContract.Types.delegated_bandwidth[];
	rex?: SystemContract.Types.rex_balance;
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
