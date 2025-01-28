import type {Action, NameType, UInt64Type} from '@wharfkit/antelope'
import {
    ABI,
    Asset,
    Blob,
    Bytes,
    Int64,
    Name,
    Struct,
    TimePoint,
    TimePointSec,
    UInt64,
    UInt8,
} from '@wharfkit/antelope'
import type {ActionOptions, ContractArgs, PartialBy, Table} from '@wharfkit/contract'
import {Contract as BaseContract} from '@wharfkit/contract'
export const abiBlob = Blob.from(
    'DmVvc2lvOjphYmkvMS4yAA4IYWRkdG9rZW4AAghjb250cmFjdARuYW1lBnN5bWJvbAZzeW1ib2wKY29uZmlnX3JvdwAED3N5c3RlbV9jb250cmFjdARuYW1lFHN5c3RlbV9jb250cmFjdF9tc2lnBG5hbWUVc3lzdGVtX3Rva2VuX2NvbnRyYWN0BG5hbWUTc3lzdGVtX3Rva2VuX3N5bWJvbAZzeW1ib2wTZGVsZWdhdGVkX2JhbmR3aWR0aAAEBGZyb20EbmFtZQJ0bwRuYW1lCm5ldF93ZWlnaHQFYXNzZXQKY3B1X3dlaWdodAVhc3NldBRnZXRfYWNjb3VudF9yZXNwb25zZQAHB2FjY291bnQEbmFtZQdiYWxhbmNlBWFzc2V0C2RlbGVnYXRpb25zFWRlbGVnYXRlZF9iYW5kd2lkdGhbXQlwcm9wb3NhbHMKcHJvcG9zYWxbXQZyZWZ1bmQOcmVmdW5kX3JlcXVlc3QGcmV4YmFsC3JleF9iYWxhbmNlB3JleGZ1bmQIcmV4X2Z1bmQKZ2V0YWNjb3VudAABB2FjY291bnQEbmFtZQtnZXRiYWxhbmNlcwABB2FjY291bnQEbmFtZRlwYWlyX3RpbWVfcG9pbnRfc2VjX2ludDY0AAIFZmlyc3QOdGltZV9wb2ludF9zZWMGc2Vjb25kBWludDY0CHByb3Bvc2FsAAMNcHJvcG9zYWxfbmFtZQRuYW1lEnBhY2tlZF90cmFuc2FjdGlvbgVieXRlcxJlYXJsaWVzdF9leGVjX3RpbWUMdGltZV9wb2ludD8kDnJlZnVuZF9yZXF1ZXN0AAQFb3duZXIEbmFtZQxyZXF1ZXN0X3RpbWUOdGltZV9wb2ludF9zZWMKbmV0X2Ftb3VudAVhc3NldApjcHVfYW1vdW50BWFzc2V0C3JlbW92ZXRva2VuAAECaWQGdWludDY0C3JleF9iYWxhbmNlAAYHdmVyc2lvbgV1aW50OAVvd25lcgRuYW1lCnZvdGVfc3Rha2UFYXNzZXQLcmV4X2JhbGFuY2UFYXNzZXQLbWF0dXJlZF9yZXgFaW50NjQOcmV4X21hdHVyaXRpZXMbcGFpcl90aW1lX3BvaW50X3NlY19pbnQ2NFtdCHJleF9mdW5kAAMHdmVyc2lvbgV1aW50OAVvd25lcgRuYW1lB2JhbGFuY2UFYXNzZXQJc2V0Y29uZmlnAAQPc3lzdGVtX2NvbnRyYWN0BG5hbWUUc3lzdGVtX2NvbnRyYWN0X21zaWcEbmFtZRVzeXN0ZW1fdG9rZW5fY29udHJhY3QEbmFtZRNzeXN0ZW1fdG9rZW5fc3ltYm9sBnN5bWJvbAl0b2tlbl9yb3cAAwJpZAZ1aW50NjQIY29udHJhY3QEbmFtZQZzeW1ib2wGc3ltYm9sBQAAAFNBmlMyCGFkZHRva2VuAABAnpoiZLJiCmdldGFjY291bnTHAS0tLQoKc3BlY192ZXJzaW9uOiAiMC4yLjAiCnRpdGxlOiBnZXRhY2NvdW50CnN1bW1hcnk6ICdSZWFkLW9ubHkgQVBJIHRvIGdldCBhY2NvdW50IGRhdGEnCmljb246IGh0dHBzOi8vYXZhdGFycy5naXRodWJ1c2VyY29udGVudC5jb20vdS8xNDcyOTI4NjE/cz00MDAmdT0zYjFhZjY2ZTkwZGQ4NTFmNGQ3YzA5NmVkNmEyZmJiNGI5ZTE5MGRhCgotLS0AsELTRHOyYgtnZXRiYWxhbmNlcwAApoI0q02lugtyZW1vdmV0b2tlbgAAAGBuTYqywglzZXRjb25maWcAAgAAAAAwtyZFA2k2NAAACmNvbmZpZ19yb3cAAAAA4KkgzQNpNjQAAAl0b2tlbl9yb3cBA2FwaQNhcGkAAAACAECemiJksmIUZ2V0X2FjY291bnRfcmVzcG9uc2UAsELTRHOyYgdhc3NldFtd'
)
export const abi = ABI.from(abiBlob)
export namespace Types {
    @Struct.type('addtoken')
    export class addtoken extends Struct {
        @Struct.field(Name)
        declare contract: Name
        @Struct.field(Asset.Symbol)
        declare symbol: Asset.Symbol
    }
    @Struct.type('config_row')
    export class config_row extends Struct {
        @Struct.field(Name)
        declare system_contract: Name
        @Struct.field(Name)
        declare system_contract_msig: Name
        @Struct.field(Name)
        declare system_token_contract: Name
        @Struct.field(Asset.Symbol)
        declare system_token_symbol: Asset.Symbol
    }
    @Struct.type('delegated_bandwidth')
    export class delegated_bandwidth extends Struct {
        @Struct.field(Name)
        declare from: Name
        @Struct.field(Name)
        declare to: Name
        @Struct.field(Asset)
        declare net_weight: Asset
        @Struct.field(Asset)
        declare cpu_weight: Asset
    }
    @Struct.type('proposal')
    export class proposal extends Struct {
        @Struct.field(Name)
        declare proposal_name: Name
        @Struct.field(Bytes)
        declare packed_transaction: Bytes
        @Struct.field(TimePoint, {optional: true})
        declare earliest_exec_time?: TimePoint
    }
    @Struct.type('refund_request')
    export class refund_request extends Struct {
        @Struct.field(Name)
        declare owner: Name
        @Struct.field(TimePointSec)
        declare request_time: TimePointSec
        @Struct.field(Asset)
        declare net_amount: Asset
        @Struct.field(Asset)
        declare cpu_amount: Asset
    }
    @Struct.type('pair_time_point_sec_int64')
    export class pair_time_point_sec_int64 extends Struct {
        @Struct.field(TimePointSec)
        declare first: TimePointSec
        @Struct.field(Int64)
        declare second: Int64
    }
    @Struct.type('rex_balance')
    export class rex_balance extends Struct {
        @Struct.field(UInt8)
        declare version: UInt8
        @Struct.field(Name)
        declare owner: Name
        @Struct.field(Asset)
        declare vote_stake: Asset
        @Struct.field(Asset)
        declare rex_balance: Asset
        @Struct.field(Int64)
        declare matured_rex: Int64
        @Struct.field(pair_time_point_sec_int64, {array: true})
        declare rex_maturities: pair_time_point_sec_int64[]
    }
    @Struct.type('rex_fund')
    export class rex_fund extends Struct {
        @Struct.field(UInt8)
        declare version: UInt8
        @Struct.field(Name)
        declare owner: Name
        @Struct.field(Asset)
        declare balance: Asset
    }
    @Struct.type('get_account_response')
    export class get_account_response extends Struct {
        @Struct.field(Name)
        declare account: Name
        @Struct.field(Asset)
        declare balance: Asset
        @Struct.field(delegated_bandwidth, {array: true})
        declare delegations: delegated_bandwidth[]
        @Struct.field(proposal, {array: true})
        declare proposals: proposal[]
        @Struct.field(refund_request)
        declare refund: refund_request
        @Struct.field(rex_balance)
        declare rexbal: rex_balance
        @Struct.field(rex_fund)
        declare rexfund: rex_fund
    }
    @Struct.type('getaccount')
    export class getaccount extends Struct {
        @Struct.field(Name)
        declare account: Name
    }
    @Struct.type('getbalances')
    export class getbalances extends Struct {
        @Struct.field(Name)
        declare account: Name
    }
    @Struct.type('removetoken')
    export class removetoken extends Struct {
        @Struct.field(UInt64)
        declare id: UInt64
    }
    @Struct.type('setconfig')
    export class setconfig extends Struct {
        @Struct.field(Name)
        declare system_contract: Name
        @Struct.field(Name)
        declare system_contract_msig: Name
        @Struct.field(Name)
        declare system_token_contract: Name
        @Struct.field(Asset.Symbol)
        declare system_token_symbol: Asset.Symbol
    }
    @Struct.type('token_row')
    export class token_row extends Struct {
        @Struct.field(UInt64)
        declare id: UInt64
        @Struct.field(Name)
        declare contract: Name
        @Struct.field(Asset.Symbol)
        declare symbol: Asset.Symbol
    }
}
export const TableMap = {
    config: Types.config_row,
    tokens: Types.token_row,
}
export interface TableTypes {
    config: Types.config_row
    tokens: Types.token_row
}
export type RowType<T> = T extends keyof TableTypes ? TableTypes[T] : any
export type TableNames = keyof TableTypes
export namespace ActionParams {
    export namespace Type {}
    export interface addtoken {
        contract: NameType
        symbol: Asset.SymbolType
    }
    export interface getaccount {
        account: NameType
    }
    export interface getbalances {
        account: NameType
    }
    export interface removetoken {
        id: UInt64Type
    }
    export interface setconfig {
        system_contract: NameType
        system_contract_msig: NameType
        system_token_contract: NameType
        system_token_symbol: Asset.SymbolType
    }
}
export interface ActionNameParams {
    addtoken: ActionParams.addtoken
    getaccount: ActionParams.getaccount
    getbalances: ActionParams.getbalances
    removetoken: ActionParams.removetoken
    setconfig: ActionParams.setconfig
}
export type ActionNames = keyof ActionNameParams
export interface ActionReturnValues {
    getaccount: Types.get_account_response
    getbalances: Asset[]
}
export type ActionReturnNames = keyof ActionReturnValues
export class Contract extends BaseContract {
    constructor(args: PartialBy<ContractArgs, 'abi' | 'account'>) {
        super({
            client: args.client,
            abi: abi,
            account: args.account || Name.from('unicove.gm'),
        })
    }
    action<T extends ActionNames>(
        name: T,
        data: ActionNameParams[T],
        options?: ActionOptions
    ): Action {
        return super.action(name, data, options)
    }
    readonly<T extends ActionReturnNames>(
        name: T,
        data?: ActionNameParams[T]
    ): ActionReturnValues[T] {
        return super.readonly(name, data) as unknown as ActionReturnValues[T]
    }
    table<T extends TableNames>(name: T, scope?: NameType): Table<RowType<T>> {
        return super.table(name, scope, TableMap[name])
    }
}
