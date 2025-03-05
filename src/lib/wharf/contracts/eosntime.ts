/* eslint-disable @typescript-eslint/no-empty-interface */
import type { Action, TimePointType } from '@wharfkit/antelope';
import { ABI, Blob, Name, Struct, TimePoint } from '@wharfkit/antelope';
import type { ActionOptions, ContractArgs, PartialBy, Table } from '@wharfkit/contract';
import { Contract as BaseContract } from '@wharfkit/contract';
export const abiBlob = Blob.from(
	'DmVvc2lvOjphYmkvMS4yAAEJY2hlY2t0aW1lAAEEdGltZQp0aW1lX3BvaW50AQAAUNJliFRDCWNoZWNrdGltZY8DLS0tCnNwZWNfdmVyc2lvbjogIjAuMi4wIgp0aXRsZTogY2hlY2t0aW1lCnN1bW1hcnk6IFRoZSBjdXJyZW50IHRpbWUgbXVzdCBiZSBwYXNzZWQge3t0aW1lfX0gdGltZXN0YW1wLgppY29uOiBodHRwczovL2dhdGV3YXkucGluYXRhLmNsb3VkL2lwZnMvUW1OdXVuNVFUM0VFZlhCZmh4Z0RGUmdTYURaczVwcjcxdlN3N3pyQWV1dVc4TSM1ZGZhZDBkZjcyNzcyZWUxY2NjMTU1ZTY3MGMxZDEyNGY1YzUxMjJmMWQ1MDI3NTY1ZGYzOGI0MTgwNDJkMWRkCi0tLQoKMS4gQXNzZXJ0IGVycm9yIGlmIHRpbWUgaXMgbm90IHBhc3NlZCB7e3RpbWV9fSB0aW1lc3RhbXAuCjIuIFRyYW5zYWN0aW9uIHNpbGVudGx5IHBhc3NlcyBpZiB0aGUgY3VycmVudCB0aW1lIGlzIHBhc3NlZCB7e3RpbWV9fSB0aW1lc3RhbXAuAAEKRU9TSU8gVGltZYoBMS4gQXNzZXJ0IGVycm9yIGlmIHRpbWUgaXMgbm90IHBhc3NlZCB7e3RpbWV9fSB0aW1lc3RhbXAuCjIuIFRyYW5zYWN0aW9uIHNpbGVudGx5IHBhc3NlcyBpZiB0aGUgY3VycmVudCB0aW1lIGlzIHBhc3NlZCB7e3RpbWV9fSB0aW1lc3RhbXAuAAAAAA=='
);
export const abi = ABI.from(abiBlob);
export namespace Types {
	@Struct.type('checktime')
	export class checktime extends Struct {
		@Struct.field(TimePoint)
		declare time: TimePoint;
	}
}
export const TableMap = {};
export interface TableTypes {}
export type RowType<T> = T extends keyof TableTypes ? TableTypes[T] : any;
export type TableNames = keyof TableTypes;
export interface ActionParams {}
export namespace ActionParams {
	export namespace Type {}
	export interface checktime {
		time: TimePointType;
	}
}
export const ActionParams: ActionParams = {} as ActionParams;
export interface ActionNameParams {
	checktime: ActionParams.checktime;
}
export type ActionNames = keyof ActionNameParams;
export class Contract extends BaseContract {
	constructor(args: PartialBy<ContractArgs, 'abi' | 'account'>) {
		super({
			client: args.client,
			abi: abi,
			account: args.account || Name.from('time.eosn')
		});
	}
	action<T extends ActionNames>(
		name: T,
		data: ActionNameParams[T],
		options?: ActionOptions
	): Action {
		return super.action(name, data, options);
	}
}
