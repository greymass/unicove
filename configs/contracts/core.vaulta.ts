import type {
	Action,
	AssetType,
	BytesType,
	Int64Type,
	NameType,
	PublicKeyType,
	UInt16Type,
	UInt32Type,
	UInt8Type
} from '@wharfkit/antelope';
import {
	ABI,
	Asset,
	Blob,
	Bytes,
	Int64,
	Name,
	PublicKey,
	Struct,
	UInt16,
	UInt32,
	UInt8
} from '@wharfkit/antelope';
import type { ActionOptions, ContractArgs, PartialBy, Table } from '@wharfkit/contract';
import { Contract as BaseContract } from '@wharfkit/contract';
export const abiBlob = Blob.from(
	'DmVvc2lvOjphYmkvMS4yADUHYWNjb3VudAACB2JhbGFuY2UFYXNzZXQIcmVsZWFzZWQEYm9vbAlhdXRob3JpdHkABAl0aHJlc2hvbGQGdWludDMyBGtleXMMa2V5X3dlaWdodFtdCGFjY291bnRzGXBlcm1pc3Npb25fbGV2ZWxfd2VpZ2h0W10Fd2FpdHMNd2FpdF93ZWlnaHRbXQdiaWRuYW1lAAMGYmlkZGVyBG5hbWUHbmV3bmFtZQRuYW1lA2JpZAVhc3NldAliaWRyZWZ1bmQAAgZiaWRkZXIEbmFtZQduZXduYW1lBG5hbWURYmxvY2tlZF9yZWNpcGllbnQAAQdhY2NvdW50BG5hbWULYmxvY2tzd2FwdG8AAgdhY2NvdW50BG5hbWUFYmxvY2sEYm9vbAZidXlyYW0AAwVwYXllcgRuYW1lCHJlY2VpdmVyBG5hbWUFcXVhbnQFYXNzZXQKYnV5cmFtYnVybgADBXBheWVyBG5hbWUIcXVhbnRpdHkFYXNzZXQEbWVtbwZzdHJpbmcLYnV5cmFtYnl0ZXMAAwVwYXllcgRuYW1lCHJlY2VpdmVyBG5hbWUFYnl0ZXMGdWludDMyCmJ1eXJhbXNlbGYAAgVwYXllcgRuYW1lBXF1YW50BWFzc2V0BmJ1eXJleAACBGZyb20EbmFtZQZhbW91bnQFYXNzZXQMY2xhaW1yZXdhcmRzAAEFb3duZXIEbmFtZQVjbG9zZQACBW93bmVyBG5hbWUGc3ltYm9sBnN5bWJvbAZjb25maWcAAQx0b2tlbl9zeW1ib2wGc3ltYm9sDmN1cnJlbmN5X3N0YXRzAAMGc3VwcGx5BWFzc2V0Cm1heF9zdXBwbHkFYXNzZXQGaXNzdWVyBG5hbWUKZGVsZWdhdGVidwAFBGZyb20EbmFtZQhyZWNlaXZlcgRuYW1lEnN0YWtlX25ldF9xdWFudGl0eQVhc3NldBJzdGFrZV9jcHVfcXVhbnRpdHkFYXNzZXQIdHJhbnNmZXIEYm9vbApkZWxldGVhdXRoAAMHYWNjb3VudARuYW1lCnBlcm1pc3Npb24EbmFtZQ1hdXRob3JpemVkX2J5BW5hbWUkB2RlcG9zaXQAAgVvd25lcgRuYW1lBmFtb3VudAVhc3NldAtkb25hdGV0b3JleAADBXBheWVyBG5hbWUIcXVhbnRpdHkFYXNzZXQEbWVtbwZzdHJpbmcKZW5mb3JjZWJhbAACB2FjY291bnQEbmFtZRRleHBlY3RlZF9lb3NfYmFsYW5jZQVhc3NldAdnaWZ0cmFtAAQEZnJvbQRuYW1lCHJlY2VpdmVyBG5hbWUJcmFtX2J5dGVzBWludDY0BG1lbW8Gc3RyaW5nBGluaXQAAQ5tYXhpbXVtX3N1cHBseQVhc3NldAprZXlfd2VpZ2h0AAIDa2V5CnB1YmxpY19rZXkGd2VpZ2h0BnVpbnQxNghsaW5rYXV0aAAFB2FjY291bnQEbmFtZQRjb2RlBG5hbWUEdHlwZQRuYW1lC3JlcXVpcmVtZW50BG5hbWUNYXV0aG9yaXplZF9ieQVuYW1lJAttdmZyc2F2aW5ncwACBW93bmVyBG5hbWUDcmV4BWFzc2V0C212dG9zYXZpbmdzAAIFb3duZXIEbmFtZQNyZXgFYXNzZXQKbmV3YWNjb3VudAAEB2NyZWF0b3IEbmFtZQRuYW1lBG5hbWUFb3duZXIJYXV0aG9yaXR5BmFjdGl2ZQlhdXRob3JpdHkLbmV3YWNjb3VudDIAAwdjcmVhdG9yBG5hbWUEbmFtZQRuYW1lA2tleQpwdWJsaWNfa2V5BG5vb3AAAQRtZW1vBnN0cmluZwRvcGVuAAMFb3duZXIEbmFtZQZzeW1ib2wGc3ltYm9sCXJhbV9wYXllcgRuYW1lEHBlcm1pc3Npb25fbGV2ZWwAAgVhY3RvcgRuYW1lCnBlcm1pc3Npb24EbmFtZRdwZXJtaXNzaW9uX2xldmVsX3dlaWdodAACCnBlcm1pc3Npb24QcGVybWlzc2lvbl9sZXZlbAZ3ZWlnaHQGdWludDE2B3Bvd2VydXAABgVwYXllcgRuYW1lCHJlY2VpdmVyBG5hbWUEZGF5cwZ1aW50MzIIbmV0X2ZyYWMFaW50NjQIY3B1X2ZyYWMFaW50NjQLbWF4X3BheW1lbnQFYXNzZXQHcmFtYnVybgADBW93bmVyBG5hbWUFYnl0ZXMFaW50NjQEbWVtbwZzdHJpbmcLcmFtdHJhbnNmZXIABARmcm9tBG5hbWUCdG8EbmFtZQVieXRlcwVpbnQ2NARtZW1vBnN0cmluZwZyZWZ1bmQAAQVvd25lcgRuYW1lB3NlbGxyYW0AAgdhY2NvdW50BG5hbWUFYnl0ZXMFaW50NjQHc2VsbHJleAACBGZyb20EbmFtZQNyZXgFYXNzZXQGc2V0YWJpAAMHYWNjb3VudARuYW1lA2FiaQVieXRlcwRtZW1vB3N0cmluZyQHc2V0Y29kZQAFB2FjY291bnQEbmFtZQZ2bXR5cGUFdWludDgJdm12ZXJzaW9uBXVpbnQ4BGNvZGUFYnl0ZXMEbWVtbwdzdHJpbmckCnN3YXBleGNlc3MAAgdhY2NvdW50BG5hbWUKZW9zX2JlZm9yZQVhc3NldAZzd2FwdG8ABARmcm9tBG5hbWUCdG8EbmFtZQhxdWFudGl0eQVhc3NldARtZW1vBnN0cmluZwlzd2FwdHJhY2UAAgdhY2NvdW50BG5hbWUIcXVhbnRpdHkFYXNzZXQIdHJhbnNmZXIABARmcm9tBG5hbWUCdG8EbmFtZQhxdWFudGl0eQVhc3NldARtZW1vBnN0cmluZwx1bmRlbGVnYXRlYncABARmcm9tBG5hbWUIcmVjZWl2ZXIEbmFtZRR1bnN0YWtlX25ldF9xdWFudGl0eQVhc3NldBR1bnN0YWtlX2NwdV9xdWFudGl0eQVhc3NldAl1bmdpZnRyYW0AAwRmcm9tBG5hbWUCdG8EbmFtZQRtZW1vBnN0cmluZwp1bmxpbmthdXRoAAQHYWNjb3VudARuYW1lBGNvZGUEbmFtZQR0eXBlBG5hbWUNYXV0aG9yaXplZF9ieQVuYW1lJAx1bnN0YWtldG9yZXgABAVvd25lcgRuYW1lCHJlY2VpdmVyBG5hbWUIZnJvbV9uZXQFYXNzZXQIZnJvbV9jcHUFYXNzZXQKdXBkYXRlYXV0aAAFB2FjY291bnQEbmFtZQpwZXJtaXNzaW9uBG5hbWUGcGFyZW50BG5hbWUEYXV0aAlhdXRob3JpdHkNYXV0aG9yaXplZF9ieQVuYW1lJAx2b3RlcHJvZHVjZXIAAwV2b3RlcgRuYW1lBXByb3h5BG5hbWUJcHJvZHVjZXJzBm5hbWVbXQp2b3RldXBkYXRlAAEKdm90ZXJfbmFtZQRuYW1lC3dhaXRfd2VpZ2h0AAIId2FpdF9zZWMGdWludDMyBndlaWdodAZ1aW50MTYId2l0aGRyYXcAAgVvd25lcgRuYW1lBmFtb3VudAVhc3NldCwAAABASTOTOwdiaWRuYW1lAAAASFMvdZM7CWJpZHJlZnVuZAAAaK6GY4hoPAtibG9ja3N3YXB0bwAAAAAASHO9PgZidXlyYW0AAMC8+khzvT4KYnV5cmFtYnVybgAAsMr+SHO9PgtidXlyYW1ieXRlcwAAwIoKS3O9PgpidXlyYW1zZWxmAAAAAAB0db0+BmJ1eXJleACA0zVcXelMRAxjbGFpbXJld2FyZHMAAAAAAACFaUQFY2xvc2UAAAA/KhumokoKZGVsZWdhdGVidwAAQMvaqKyiSgpkZWxldGVhdXRoAAAAACA7TKtKB2RlcG9zaXQAALq6NKtsJk0LZG9uYXRldG9yZXgAAEA0R6FL11QKZW5mb3JjZWJhbAAAAABAmpuXYwdnaWZ0cmFtAAAAAAAAkN10BGluaXQAAAAALWsDp4sIbGlua2F1dGgAADCbbht815YLbXZmcnNhdmluZ3MAADCbbhtM85YLbXZ0b3NhdmluZ3MAAECemiJkuJoKbmV3YWNjb3VudAAARJ6aImS4mgtuZXdhY2NvdW50MgAAAAAAAFApnQRub29wAAAAAAAAMFWlBG9wZW4AAAAAoOqrOK0HcG93ZXJ1cAAAAABgXn2kuQdyYW1idXJuAACuWniam6W5C3JhbXRyYW5zZmVyAAAAAACkqZe6BnJlZnVuZAAAAABAmhujwgdzZWxscmFtAAAAAKCrG6PCB3NlbGxyZXgAAAAAALhjssIGc2V0YWJpAAAAAEAlirLCB3NldGNvZGUAAADGCnVVDccKc3dhcGV4Y2VzcwAAAAAA0FwNxwZzd2FwdG8AAABQyNxcDccJc3dhcHRyYWNlAAAAAFctPM3NCHRyYW5zZmVyAMCPyoapqNLUDHVuZGVsZWdhdGVidwAAAJDm5uXY1Al1bmdpZnRyYW0AAEDL2sDp4tQKdW5saW5rYXV0aADQ1aVZQZPx1Ax1bnN0YWtldG9yZXgAAEDL2qhsUtUKdXBkYXRlYXV0aABwFdKJ3qoy3Qx2b3RlcHJvZHVjZXIAAIDKJlWtMt0Kdm90ZXVwZGF0ZQAAAADc3NSy4wh3aXRoZHJhdwAEAAAAOE9NETIDaTY0AAAHYWNjb3VudAAAACApiGg8A2k2NAAAEWJsb2NrZWRfcmVjaXBpZW50AAAAADC3JkUDaTY0AAAGY29uZmlnAAAAAACQTcYDaTY0AAAOY3VycmVuY3lfc3RhdHMAAAAAAA=='
);
export const abi = ABI.from(abiBlob);
export namespace Types {
	@Struct.type('account')
	export class account extends Struct {
		@Struct.field(Asset)
		declare balance: Asset;
		@Struct.field('bool')
		declare released: boolean;
	}
	@Struct.type('key_weight')
	export class key_weight extends Struct {
		@Struct.field(PublicKey)
		declare key: PublicKey;
		@Struct.field(UInt16)
		declare weight: UInt16;
	}
	@Struct.type('permission_level')
	export class permission_level extends Struct {
		@Struct.field(Name)
		declare actor: Name;
		@Struct.field(Name)
		declare permission: Name;
	}
	@Struct.type('permission_level_weight')
	export class permission_level_weight extends Struct {
		@Struct.field(permission_level)
		declare permission: permission_level;
		@Struct.field(UInt16)
		declare weight: UInt16;
	}
	@Struct.type('wait_weight')
	export class wait_weight extends Struct {
		@Struct.field(UInt32)
		declare wait_sec: UInt32;
		@Struct.field(UInt16)
		declare weight: UInt16;
	}
	@Struct.type('authority')
	export class authority extends Struct {
		@Struct.field(UInt32)
		declare threshold: UInt32;
		@Struct.field(key_weight, { array: true })
		declare keys: key_weight[];
		@Struct.field(permission_level_weight, { array: true })
		declare accounts: permission_level_weight[];
		@Struct.field(wait_weight, { array: true })
		declare waits: wait_weight[];
	}
	@Struct.type('bidname')
	export class bidname extends Struct {
		@Struct.field(Name)
		declare bidder: Name;
		@Struct.field(Name)
		declare newname: Name;
		@Struct.field(Asset)
		declare bid: Asset;
	}
	@Struct.type('bidrefund')
	export class bidrefund extends Struct {
		@Struct.field(Name)
		declare bidder: Name;
		@Struct.field(Name)
		declare newname: Name;
	}
	@Struct.type('blocked_recipient')
	export class blocked_recipient extends Struct {
		@Struct.field(Name)
		declare account: Name;
	}
	@Struct.type('blockswapto')
	export class blockswapto extends Struct {
		@Struct.field(Name)
		declare account: Name;
		@Struct.field('bool')
		declare block: boolean;
	}
	@Struct.type('buyram')
	export class buyram extends Struct {
		@Struct.field(Name)
		declare payer: Name;
		@Struct.field(Name)
		declare receiver: Name;
		@Struct.field(Asset)
		declare quant: Asset;
	}
	@Struct.type('buyramburn')
	export class buyramburn extends Struct {
		@Struct.field(Name)
		declare payer: Name;
		@Struct.field(Asset)
		declare quantity: Asset;
		@Struct.field('string')
		declare memo: string;
	}
	@Struct.type('buyrambytes')
	export class buyrambytes extends Struct {
		@Struct.field(Name)
		declare payer: Name;
		@Struct.field(Name)
		declare receiver: Name;
		@Struct.field(UInt32)
		declare bytes: UInt32;
	}
	@Struct.type('buyramself')
	export class buyramself extends Struct {
		@Struct.field(Name)
		declare payer: Name;
		@Struct.field(Asset)
		declare quant: Asset;
	}
	@Struct.type('buyrex')
	export class buyrex extends Struct {
		@Struct.field(Name)
		declare from: Name;
		@Struct.field(Asset)
		declare amount: Asset;
	}
	@Struct.type('claimrewards')
	export class claimrewards extends Struct {
		@Struct.field(Name)
		declare owner: Name;
	}
	@Struct.type('close')
	export class close extends Struct {
		@Struct.field(Name)
		declare owner: Name;
		@Struct.field(Asset.Symbol)
		declare symbol: Asset.Symbol;
	}
	@Struct.type('config')
	export class config extends Struct {
		@Struct.field(Asset.Symbol)
		declare token_symbol: Asset.Symbol;
	}
	@Struct.type('currency_stats')
	export class currency_stats extends Struct {
		@Struct.field(Asset)
		declare supply: Asset;
		@Struct.field(Asset)
		declare max_supply: Asset;
		@Struct.field(Name)
		declare issuer: Name;
	}
	@Struct.type('delegatebw')
	export class delegatebw extends Struct {
		@Struct.field(Name)
		declare from: Name;
		@Struct.field(Name)
		declare receiver: Name;
		@Struct.field(Asset)
		declare stake_net_quantity: Asset;
		@Struct.field(Asset)
		declare stake_cpu_quantity: Asset;
		@Struct.field('bool')
		declare transfer: boolean;
	}
	@Struct.type('deleteauth')
	export class deleteauth extends Struct {
		@Struct.field(Name)
		declare account: Name;
		@Struct.field(Name)
		declare permission: Name;
		@Struct.field(Name, { extension: true, optional: true })
		declare authorized_by?: Name;
	}
	@Struct.type('deposit')
	export class deposit extends Struct {
		@Struct.field(Name)
		declare owner: Name;
		@Struct.field(Asset)
		declare amount: Asset;
	}
	@Struct.type('donatetorex')
	export class donatetorex extends Struct {
		@Struct.field(Name)
		declare payer: Name;
		@Struct.field(Asset)
		declare quantity: Asset;
		@Struct.field('string')
		declare memo: string;
	}
	@Struct.type('enforcebal')
	export class enforcebal extends Struct {
		@Struct.field(Name)
		declare account: Name;
		@Struct.field(Asset)
		declare expected_eos_balance: Asset;
	}
	@Struct.type('giftram')
	export class giftram extends Struct {
		@Struct.field(Name)
		declare from: Name;
		@Struct.field(Name)
		declare receiver: Name;
		@Struct.field(Int64)
		declare ram_bytes: Int64;
		@Struct.field('string')
		declare memo: string;
	}
	@Struct.type('init')
	export class init extends Struct {
		@Struct.field(Asset)
		declare maximum_supply: Asset;
	}
	@Struct.type('linkauth')
	export class linkauth extends Struct {
		@Struct.field(Name)
		declare account: Name;
		@Struct.field(Name)
		declare code: Name;
		@Struct.field(Name)
		declare type: Name;
		@Struct.field(Name)
		declare requirement: Name;
		@Struct.field(Name, { extension: true, optional: true })
		declare authorized_by?: Name;
	}
	@Struct.type('mvfrsavings')
	export class mvfrsavings extends Struct {
		@Struct.field(Name)
		declare owner: Name;
		@Struct.field(Asset)
		declare rex: Asset;
	}
	@Struct.type('mvtosavings')
	export class mvtosavings extends Struct {
		@Struct.field(Name)
		declare owner: Name;
		@Struct.field(Asset)
		declare rex: Asset;
	}
	@Struct.type('newaccount')
	export class newaccount extends Struct {
		@Struct.field(Name)
		declare creator: Name;
		@Struct.field(Name)
		declare name: Name;
		@Struct.field(authority)
		declare owner: authority;
		@Struct.field(authority)
		declare active: authority;
	}
	@Struct.type('newaccount2')
	export class newaccount2 extends Struct {
		@Struct.field(Name)
		declare creator: Name;
		@Struct.field(Name)
		declare name: Name;
		@Struct.field(PublicKey)
		declare key: PublicKey;
	}
	@Struct.type('noop')
	export class noop extends Struct {
		@Struct.field('string')
		declare memo: string;
	}
	@Struct.type('open')
	export class open extends Struct {
		@Struct.field(Name)
		declare owner: Name;
		@Struct.field(Asset.Symbol)
		declare symbol: Asset.Symbol;
		@Struct.field(Name)
		declare ram_payer: Name;
	}
	@Struct.type('powerup')
	export class powerup extends Struct {
		@Struct.field(Name)
		declare payer: Name;
		@Struct.field(Name)
		declare receiver: Name;
		@Struct.field(UInt32)
		declare days: UInt32;
		@Struct.field(Int64)
		declare net_frac: Int64;
		@Struct.field(Int64)
		declare cpu_frac: Int64;
		@Struct.field(Asset)
		declare max_payment: Asset;
	}
	@Struct.type('ramburn')
	export class ramburn extends Struct {
		@Struct.field(Name)
		declare owner: Name;
		@Struct.field(Int64)
		declare bytes: Int64;
		@Struct.field('string')
		declare memo: string;
	}
	@Struct.type('ramtransfer')
	export class ramtransfer extends Struct {
		@Struct.field(Name)
		declare from: Name;
		@Struct.field(Name)
		declare to: Name;
		@Struct.field(Int64)
		declare bytes: Int64;
		@Struct.field('string')
		declare memo: string;
	}
	@Struct.type('refund')
	export class refund extends Struct {
		@Struct.field(Name)
		declare owner: Name;
	}
	@Struct.type('sellram')
	export class sellram extends Struct {
		@Struct.field(Name)
		declare account: Name;
		@Struct.field(Int64)
		declare bytes: Int64;
	}
	@Struct.type('sellrex')
	export class sellrex extends Struct {
		@Struct.field(Name)
		declare from: Name;
		@Struct.field(Asset)
		declare rex: Asset;
	}
	@Struct.type('setabi')
	export class setabi extends Struct {
		@Struct.field(Name)
		declare account: Name;
		@Struct.field(Bytes)
		declare abi: Bytes;
		@Struct.field('string', { extension: true, optional: true })
		declare memo?: string;
	}
	@Struct.type('setcode')
	export class setcode extends Struct {
		@Struct.field(Name)
		declare account: Name;
		@Struct.field(UInt8)
		declare vmtype: UInt8;
		@Struct.field(UInt8)
		declare vmversion: UInt8;
		@Struct.field(Bytes)
		declare code: Bytes;
		@Struct.field('string', { extension: true, optional: true })
		declare memo?: string;
	}
	@Struct.type('swapexcess')
	export class swapexcess extends Struct {
		@Struct.field(Name)
		declare account: Name;
		@Struct.field(Asset)
		declare eos_before: Asset;
	}
	@Struct.type('swapto')
	export class swapto extends Struct {
		@Struct.field(Name)
		declare from: Name;
		@Struct.field(Name)
		declare to: Name;
		@Struct.field(Asset)
		declare quantity: Asset;
		@Struct.field('string')
		declare memo: string;
	}
	@Struct.type('swaptrace')
	export class swaptrace extends Struct {
		@Struct.field(Name)
		declare account: Name;
		@Struct.field(Asset)
		declare quantity: Asset;
	}
	@Struct.type('transfer')
	export class transfer extends Struct {
		@Struct.field(Name)
		declare from: Name;
		@Struct.field(Name)
		declare to: Name;
		@Struct.field(Asset)
		declare quantity: Asset;
		@Struct.field('string')
		declare memo: string;
	}
	@Struct.type('undelegatebw')
	export class undelegatebw extends Struct {
		@Struct.field(Name)
		declare from: Name;
		@Struct.field(Name)
		declare receiver: Name;
		@Struct.field(Asset)
		declare unstake_net_quantity: Asset;
		@Struct.field(Asset)
		declare unstake_cpu_quantity: Asset;
	}
	@Struct.type('ungiftram')
	export class ungiftram extends Struct {
		@Struct.field(Name)
		declare from: Name;
		@Struct.field(Name)
		declare to: Name;
		@Struct.field('string')
		declare memo: string;
	}
	@Struct.type('unlinkauth')
	export class unlinkauth extends Struct {
		@Struct.field(Name)
		declare account: Name;
		@Struct.field(Name)
		declare code: Name;
		@Struct.field(Name)
		declare type: Name;
		@Struct.field(Name, { extension: true, optional: true })
		declare authorized_by?: Name;
	}
	@Struct.type('unstaketorex')
	export class unstaketorex extends Struct {
		@Struct.field(Name)
		declare owner: Name;
		@Struct.field(Name)
		declare receiver: Name;
		@Struct.field(Asset)
		declare from_net: Asset;
		@Struct.field(Asset)
		declare from_cpu: Asset;
	}
	@Struct.type('updateauth')
	export class updateauth extends Struct {
		@Struct.field(Name)
		declare account: Name;
		@Struct.field(Name)
		declare permission: Name;
		@Struct.field(Name)
		declare parent: Name;
		@Struct.field(authority)
		declare auth: authority;
		@Struct.field(Name, { extension: true, optional: true })
		declare authorized_by?: Name;
	}
	@Struct.type('voteproducer')
	export class voteproducer extends Struct {
		@Struct.field(Name)
		declare voter: Name;
		@Struct.field(Name)
		declare proxy: Name;
		@Struct.field(Name, { array: true })
		declare producers: Name[];
	}
	@Struct.type('voteupdate')
	export class voteupdate extends Struct {
		@Struct.field(Name)
		declare voter_name: Name;
	}
	@Struct.type('withdraw')
	export class withdraw extends Struct {
		@Struct.field(Name)
		declare owner: Name;
		@Struct.field(Asset)
		declare amount: Asset;
	}
}
export const TableMap = {
	accounts: Types.account,
	blocked: Types.blocked_recipient,
	config: Types.config,
	stat: Types.currency_stats
};
export interface TableTypes {
	accounts: Types.account;
	blocked: Types.blocked_recipient;
	config: Types.config;
	stat: Types.currency_stats;
}
export type RowType<T> = T extends keyof TableTypes ? TableTypes[T] : any;
export type TableNames = keyof TableTypes;
export namespace ActionParams {
	export namespace Type {
		export interface authority {
			threshold: UInt32Type;
			keys: Type.key_weight[];
			accounts: Type.permission_level_weight[];
			waits: Type.wait_weight[];
		}
		export interface key_weight {
			key: PublicKeyType;
			weight: UInt16Type;
		}
		export interface permission_level_weight {
			permission: Type.permission_level;
			weight: UInt16Type;
		}
		export interface permission_level {
			actor: NameType;
			permission: NameType;
		}
		export interface wait_weight {
			wait_sec: UInt32Type;
			weight: UInt16Type;
		}
	}
	export interface bidname {
		bidder: NameType;
		newname: NameType;
		bid: AssetType;
	}
	export interface bidrefund {
		bidder: NameType;
		newname: NameType;
	}
	export interface blockswapto {
		account: NameType;
		block: boolean;
	}
	export interface buyram {
		payer: NameType;
		receiver: NameType;
		quant: AssetType;
	}
	export interface buyramburn {
		payer: NameType;
		quantity: AssetType;
		memo: string;
	}
	export interface buyrambytes {
		payer: NameType;
		receiver: NameType;
		bytes: UInt32Type;
	}
	export interface buyramself {
		payer: NameType;
		quant: AssetType;
	}
	export interface buyrex {
		from: NameType;
		amount: AssetType;
	}
	export interface claimrewards {
		owner: NameType;
	}
	export interface close {
		owner: NameType;
		symbol: Asset.SymbolType;
	}
	export interface delegatebw {
		from: NameType;
		receiver: NameType;
		stake_net_quantity: AssetType;
		stake_cpu_quantity: AssetType;
		transfer: boolean;
	}
	export interface deleteauth {
		account: NameType;
		permission: NameType;
		authorized_by?: NameType;
	}
	export interface deposit {
		owner: NameType;
		amount: AssetType;
	}
	export interface donatetorex {
		payer: NameType;
		quantity: AssetType;
		memo: string;
	}
	export interface enforcebal {
		account: NameType;
		expected_eos_balance: AssetType;
	}
	export interface giftram {
		from: NameType;
		receiver: NameType;
		ram_bytes: Int64Type;
		memo: string;
	}
	export interface init {
		maximum_supply: AssetType;
	}
	export interface linkauth {
		account: NameType;
		code: NameType;
		type: NameType;
		requirement: NameType;
		authorized_by?: NameType;
	}
	export interface mvfrsavings {
		owner: NameType;
		rex: AssetType;
	}
	export interface mvtosavings {
		owner: NameType;
		rex: AssetType;
	}
	export interface newaccount {
		creator: NameType;
		name: NameType;
		owner: Type.authority;
		active: Type.authority;
	}
	export interface newaccount2 {
		creator: NameType;
		name: NameType;
		key: PublicKeyType;
	}
	export interface noop {
		memo: string;
	}
	export interface open {
		owner: NameType;
		symbol: Asset.SymbolType;
		ram_payer: NameType;
	}
	export interface powerup {
		payer: NameType;
		receiver: NameType;
		days: UInt32Type;
		net_frac: Int64Type;
		cpu_frac: Int64Type;
		max_payment: AssetType;
	}
	export interface ramburn {
		owner: NameType;
		bytes: Int64Type;
		memo: string;
	}
	export interface ramtransfer {
		from: NameType;
		to: NameType;
		bytes: Int64Type;
		memo: string;
	}
	export interface refund {
		owner: NameType;
	}
	export interface sellram {
		account: NameType;
		bytes: Int64Type;
	}
	export interface sellrex {
		from: NameType;
		rex: AssetType;
	}
	export interface setabi {
		account: NameType;
		abi: BytesType;
		memo?: string;
	}
	export interface setcode {
		account: NameType;
		vmtype: UInt8Type;
		vmversion: UInt8Type;
		code: BytesType;
		memo?: string;
	}
	export interface swapexcess {
		account: NameType;
		eos_before: AssetType;
	}
	export interface swapto {
		from: NameType;
		to: NameType;
		quantity: AssetType;
		memo: string;
	}
	export interface swaptrace {
		account: NameType;
		quantity: AssetType;
	}
	export interface transfer {
		from: NameType;
		to: NameType;
		quantity: AssetType;
		memo: string;
	}
	export interface undelegatebw {
		from: NameType;
		receiver: NameType;
		unstake_net_quantity: AssetType;
		unstake_cpu_quantity: AssetType;
	}
	export interface ungiftram {
		from: NameType;
		to: NameType;
		memo: string;
	}
	export interface unlinkauth {
		account: NameType;
		code: NameType;
		type: NameType;
		authorized_by?: NameType;
	}
	export interface unstaketorex {
		owner: NameType;
		receiver: NameType;
		from_net: AssetType;
		from_cpu: AssetType;
	}
	export interface updateauth {
		account: NameType;
		permission: NameType;
		parent: NameType;
		auth: Type.authority;
		authorized_by?: NameType;
	}
	export interface voteproducer {
		voter: NameType;
		proxy: NameType;
		producers: NameType[];
	}
	export interface voteupdate {
		voter_name: NameType;
	}
	export interface withdraw {
		owner: NameType;
		amount: AssetType;
	}
}
export interface ActionNameParams {
	bidname: ActionParams.bidname;
	bidrefund: ActionParams.bidrefund;
	blockswapto: ActionParams.blockswapto;
	buyram: ActionParams.buyram;
	buyramburn: ActionParams.buyramburn;
	buyrambytes: ActionParams.buyrambytes;
	buyramself: ActionParams.buyramself;
	buyrex: ActionParams.buyrex;
	claimrewards: ActionParams.claimrewards;
	close: ActionParams.close;
	delegatebw: ActionParams.delegatebw;
	deleteauth: ActionParams.deleteauth;
	deposit: ActionParams.deposit;
	donatetorex: ActionParams.donatetorex;
	enforcebal: ActionParams.enforcebal;
	giftram: ActionParams.giftram;
	init: ActionParams.init;
	linkauth: ActionParams.linkauth;
	mvfrsavings: ActionParams.mvfrsavings;
	mvtosavings: ActionParams.mvtosavings;
	newaccount: ActionParams.newaccount;
	newaccount2: ActionParams.newaccount2;
	noop: ActionParams.noop;
	open: ActionParams.open;
	powerup: ActionParams.powerup;
	ramburn: ActionParams.ramburn;
	ramtransfer: ActionParams.ramtransfer;
	refund: ActionParams.refund;
	sellram: ActionParams.sellram;
	sellrex: ActionParams.sellrex;
	setabi: ActionParams.setabi;
	setcode: ActionParams.setcode;
	swapexcess: ActionParams.swapexcess;
	swapto: ActionParams.swapto;
	swaptrace: ActionParams.swaptrace;
	transfer: ActionParams.transfer;
	undelegatebw: ActionParams.undelegatebw;
	ungiftram: ActionParams.ungiftram;
	unlinkauth: ActionParams.unlinkauth;
	unstaketorex: ActionParams.unstaketorex;
	updateauth: ActionParams.updateauth;
	voteproducer: ActionParams.voteproducer;
	voteupdate: ActionParams.voteupdate;
	withdraw: ActionParams.withdraw;
}
export type ActionNames = keyof ActionNameParams;
export class Contract extends BaseContract {
	constructor(args: PartialBy<ContractArgs, 'abi' | 'account'>) {
		super({
			client: args.client,
			abi: abi,
			account: args.account || Name.from('core.vaulta')
		});
	}
	action<T extends ActionNames>(
		name: T,
		data: ActionNameParams[T],
		options?: ActionOptions
	): Action {
		return super.action(name, data, options);
	}
	table<T extends TableNames>(name: T, scope?: NameType): Table<RowType<T>> {
		return super.table(name, scope, TableMap[name]);
	}
}
