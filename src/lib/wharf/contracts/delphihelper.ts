/* eslint-disable @typescript-eslint/no-empty-interface */
import type { Action } from '@wharfkit/antelope';
import { ABI, Asset, Blob, Name, Struct } from '@wharfkit/antelope';
import type { ActionOptions, ContractArgs, PartialBy, Table } from '@wharfkit/contract';
import { Contract as BaseContract } from '@wharfkit/contract';
export const abiBlob = Blob.from(
	'DmVvc2lvOjphYmkvMS4yAAQIZ2V0cGFpcnMAABB0b2tlbl9kZWZpbml0aW9uAAIGc3ltYm9sBnN5bWJvbAhjb250cmFjdARuYW1lCnRva2VuX3BhaXIAAwRiYXNlEHRva2VuX2RlZmluaXRpb24FcXVvdGUQdG9rZW5fZGVmaW5pdGlvbgVwcmljZQVhc3NldAl0b2tlbnBhaXIAAAIAAAD4OlOzYghnZXRwYWlycwAAALjO1KkgzQl0b2tlbnBhaXIAAAEDYXBpA2FwaQAAAAIAAAD4OlOzYgx0b2tlbl9wYWlyW10AALjO1KkgzQp0b2tlbl9wYWly'
);
export const abi = ABI.from(abiBlob);
export namespace Types {
	@Struct.type('getpairs')
	export class getpairs extends Struct {}
	@Struct.type('token_definition')
	export class token_definition extends Struct {
		@Struct.field(Asset.Symbol)
		declare symbol: Asset.Symbol;
		@Struct.field(Name)
		declare contract: Name;
	}
	@Struct.type('token_pair')
	export class token_pair extends Struct {
		@Struct.field(token_definition)
		declare base: token_definition;
		@Struct.field(token_definition)
		declare quote: token_definition;
		@Struct.field(Asset)
		declare price: Asset;
	}
	@Struct.type('tokenpair')
	export class tokenpair extends Struct {}
}
export const TableMap = {};
export interface TableTypes {}
export type RowType<T> = T extends keyof TableTypes ? TableTypes[T] : any;
export type TableNames = keyof TableTypes;
export interface ActionParams {}
export namespace ActionParams {
	export namespace Type {}
	export interface getpairs {}
	export interface tokenpair {}
}
export const ActionParams: ActionParams = {} as ActionParams;
export interface ActionNameParams {
	getpairs: ActionParams.getpairs;
	tokenpair: ActionParams.tokenpair;
}
export type ActionNames = keyof ActionNameParams;
export interface ActionReturnValues {
	getpairs: Types.token_pair[];
	tokenpair: Types.token_pair;
}
export type ActionReturnNames = keyof ActionReturnValues;
export class Contract extends BaseContract {
	constructor(args: PartialBy<ContractArgs, 'abi' | 'account'>) {
		super({
			client: args.client,
			abi: abi,
			account: args.account || Name.from('delphihelper')
		});
	}
	action<T extends ActionNames>(
		name: T,
		data: ActionNameParams[T],
		options?: ActionOptions
	): Action {
		return super.action(name, data, options);
	}
	readonly<T extends ActionReturnNames>(
		name: T,
		data?: ActionNameParams[T]
	): ActionReturnValues[T] {
		return super.readonly(name, data) as unknown as ActionReturnValues[T];
	}
}
