import type { Action, AssetType, Int64Type } from '@wharfkit/antelope';
import { ABI, Asset, Blob, Int64, Name, Struct } from '@wharfkit/antelope';
import type { ActionOptions, ContractArgs, PartialBy, Table } from '@wharfkit/contract';
import { Contract as BaseContract } from '@wharfkit/contract';
export const abiBlob = Blob.from(
	'DmVvc2lvOjphYmkvMS4xAAELcG93dXByZXN1bHQAAwNmZWUFYXNzZXQJcG93dXBfbmV0BWludDY0CXBvd3VwX2NwdQVpbnQ2NAEActRY3ao5rQtwb3d1cHJlc3VsdAAAAAAAAAA='
);
export const abi = ABI.from(abiBlob);
export namespace Types {
	@Struct.type('powupresult')
	export class powupresult extends Struct {
		@Struct.field(Asset)
		declare fee: Asset;
		@Struct.field(Int64)
		declare powup_net: Int64;
		@Struct.field(Int64)
		declare powup_cpu: Int64;
	}
}
export const TableMap = {};
export interface TableTypes {}
export type RowType<T> = T extends keyof TableTypes ? TableTypes[T] : any;
export type TableNames = keyof TableTypes;
export namespace ActionParams {
	export namespace Type {}
	export interface powupresult {
		fee: AssetType;
		powup_net: Int64Type;
		powup_cpu: Int64Type;
	}
}
export interface ActionNameParams {
	powupresult: ActionParams.powupresult;
}
export type ActionNames = keyof ActionNameParams;
export class Contract extends BaseContract {
	constructor(args: PartialBy<ContractArgs, 'abi' | 'account'>) {
		super({
			client: args.client,
			abi: abi,
			account: args.account || Name.from('eosio.reserv')
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
