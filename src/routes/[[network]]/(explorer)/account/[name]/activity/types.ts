import type {
	AnyAction,
	API,
	Checksum256,
	Int32,
	Int64,
	Name,
	PermissionLevel,
	TimePointSec
} from '@wharfkit/antelope';

export interface Activity {
	actions: ActivityAction[];
	first: Int64;
	last: Int64;
	head_block_num: Int32;
}

export interface ActivityAction {
	id: Checksum256;
	timestamp: TimePointSec;
	contract: Name;
	action: Name;
	authorizations: PermissionLevel[];
	data: AnyAction;
	raw: API.v1.OrderedActionsResult;
}
