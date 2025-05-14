import type { Action, AssetType, NameType } from '@wharfkit/antelope';
import { ABI, Asset, Blob, Name, Struct } from '@wharfkit/antelope';
import type { ActionOptions, ContractArgs, PartialBy, Table } from '@wharfkit/contract';
import { Contract as BaseContract } from '@wharfkit/contract';
export const abiBlob = Blob.from(
	'DmVvc2lvOjphYmkvMS4xAAQJYnV5cmVzdWx0AAEMcmV4X3JlY2VpdmVkBWFzc2V0C29yZGVycmVzdWx0AAIFb3duZXIEbmFtZQhwcm9jZWVkcwVhc3NldApyZW50cmVzdWx0AAENcmVudGVkX3Rva2VucwVhc3NldApzZWxscmVzdWx0AAEIcHJvY2VlZHMFYXNzZXQEAADIUWN1vT4JYnV5cmVzdWx0AABy1Fjdq9KlC29yZGVycmVzdWx0AABAjhqrm6e6CnJlbnRyZXN1bHQAAECOGqsbo8IKc2VsbHJlc3VsdAAAAAAAAAA='
);
export const abi = ABI.from(abiBlob);
export namespace Types {
	@Struct.type('buyresult')
	export class buyresult extends Struct {
		@Struct.field(Asset)
		declare rex_received: Asset;
	}
	@Struct.type('orderresult')
	export class orderresult extends Struct {
		@Struct.field(Name)
		declare owner: Name;
		@Struct.field(Asset)
		declare proceeds: Asset;
	}
	@Struct.type('rentresult')
	export class rentresult extends Struct {
		@Struct.field(Asset)
		declare rented_tokens: Asset;
	}
	@Struct.type('sellresult')
	export class sellresult extends Struct {
		@Struct.field(Asset)
		declare proceeds: Asset;
	}
}
export const TableMap = {};
export interface TableTypes {}
export type RowType<T> = T extends keyof TableTypes ? TableTypes[T] : any;
export type TableNames = keyof TableTypes;
export namespace ActionParams {
	export namespace Type {}
	export interface buyresult {
		rex_received: AssetType;
	}
	export interface orderresult {
		owner: NameType;
		proceeds: AssetType;
	}
	export interface rentresult {
		rented_tokens: AssetType;
	}
	export interface sellresult {
		proceeds: AssetType;
	}
}
export interface ActionNameParams {
	buyresult: ActionParams.buyresult;
	orderresult: ActionParams.orderresult;
	rentresult: ActionParams.rentresult;
	sellresult: ActionParams.sellresult;
}
export type ActionNames = keyof ActionNameParams;
export class Contract extends BaseContract {
	constructor(args: PartialBy<ContractArgs, 'abi' | 'account'>) {
		super({
			client: args.client,
			abi: abi,
			account: args.account || Name.from('eosio.rex')
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
