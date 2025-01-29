import type {Action, NameType} from '@wharfkit/antelope'
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
    UInt8,
} from '@wharfkit/antelope'
import type {ActionOptions, ContractArgs, PartialBy, Table} from '@wharfkit/contract'
import {Contract as BaseContract} from '@wharfkit/contract'
export const abiBlob = Blob.from(
    'DmVvc2lvOjphYmkvMS4yAAwHYWNjb3VudAABB2FjY291bnQEbmFtZQhiYWxhbmNlcwADB2FjY291bnQEbmFtZQZ0b2tlbnMSdG9rZW5fZGVmaW5pdGlvbltdDHplcm9iYWxhbmNlcwRib29sCmNvbmZpZ19yb3cABA9zeXN0ZW1fY29udHJhY3QEbmFtZRRzeXN0ZW1fY29udHJhY3RfbXNpZwRuYW1lFXN5c3RlbV90b2tlbl9jb250cmFjdARuYW1lE3N5c3RlbV90b2tlbl9zeW1ib2wGc3ltYm9sE2RlbGVnYXRlZF9iYW5kd2lkdGgABARmcm9tBG5hbWUCdG8EbmFtZQpuZXRfd2VpZ2h0BWFzc2V0CmNwdV93ZWlnaHQFYXNzZXQUZ2V0X2FjY291bnRfcmVzcG9uc2UABwdhY2NvdW50BG5hbWUHYmFsYW5jZQVhc3NldAtkZWxlZ2F0aW9ucxVkZWxlZ2F0ZWRfYmFuZHdpZHRoW10JcHJvcG9zYWxzCnByb3Bvc2FsW10GcmVmdW5kDnJlZnVuZF9yZXF1ZXN0BnJleGJhbAtyZXhfYmFsYW5jZQdyZXhmdW5kCHJleF9mdW5kGXBhaXJfdGltZV9wb2ludF9zZWNfaW50NjQAAgVmaXJzdA50aW1lX3BvaW50X3NlYwZzZWNvbmQFaW50NjQIcHJvcG9zYWwAAw1wcm9wb3NhbF9uYW1lBG5hbWUScGFja2VkX3RyYW5zYWN0aW9uBWJ5dGVzEmVhcmxpZXN0X2V4ZWNfdGltZQx0aW1lX3BvaW50PyQOcmVmdW5kX3JlcXVlc3QABAVvd25lcgRuYW1lDHJlcXVlc3RfdGltZQ50aW1lX3BvaW50X3NlYwpuZXRfYW1vdW50BWFzc2V0CmNwdV9hbW91bnQFYXNzZXQLcmV4X2JhbGFuY2UABgd2ZXJzaW9uBXVpbnQ4BW93bmVyBG5hbWUKdm90ZV9zdGFrZQVhc3NldAtyZXhfYmFsYW5jZQVhc3NldAttYXR1cmVkX3JleAVpbnQ2NA5yZXhfbWF0dXJpdGllcxtwYWlyX3RpbWVfcG9pbnRfc2VjX2ludDY0W10IcmV4X2Z1bmQAAwd2ZXJzaW9uBXVpbnQ4BW93bmVyBG5hbWUHYmFsYW5jZQVhc3NldAlzZXRjb25maWcABA9zeXN0ZW1fY29udHJhY3QEbmFtZRRzeXN0ZW1fY29udHJhY3RfbXNpZwRuYW1lFXN5c3RlbV90b2tlbl9jb250cmFjdARuYW1lE3N5c3RlbV90b2tlbl9zeW1ib2wGc3ltYm9sEHRva2VuX2RlZmluaXRpb24AAghjb250cmFjdARuYW1lBnN5bWJvbAZzeW1ib2wDAAAAIE9NETIHYWNjb3VudL8BLS0tCgpzcGVjX3ZlcnNpb246ICIwLjIuMCIKdGl0bGU6IGFjY291bnQKc3VtbWFyeTogJ1JldHJpZXZlIGFjY291bnQgaW5mb3JtYXRpb24nCmljb246IGh0dHBzOi8vYXZhdGFycy5naXRodWJ1c2VyY29udGVudC5jb20vdS8xNDcyOTI4NjE/cz00MDAmdT0zYjFhZjY2ZTkwZGQ4NTFmNGQ3YzA5NmVkNmEyZmJiNGI5ZTE5MGRhCgotLS0AAABYoWmiOQhiYWxhbmNlc8YBLS0tCgpzcGVjX3ZlcnNpb246ICIwLjIuMCIKdGl0bGU6IGJhbGFuY2VzCnN1bW1hcnk6ICdSZXRyaWV2ZSB0b2tlbiBiYWxhbmNlIGluZm9ybWF0aW9uJwppY29uOiBodHRwczovL2F2YXRhcnMuZ2l0aHVidXNlcmNvbnRlbnQuY29tL3UvMTQ3MjkyODYxP3M9NDAwJnU9M2IxYWY2NmU5MGRkODUxZjRkN2MwOTZlZDZhMmZiYjRiOWUxOTBkYQoKLS0tAABgbk2KssIJc2V0Y29uZmlnvwEtLS0KCnNwZWNfdmVyc2lvbjogIjAuMi4wIgp0aXRsZTogc2V0Y29uZmlnCnN1bW1hcnk6ICdTZXQgY29udHJhY3QgY29uZmlndXJhdGlvbicKaWNvbjogaHR0cHM6Ly9hdmF0YXJzLmdpdGh1YnVzZXJjb250ZW50LmNvbS91LzE0NzI5Mjg2MT9zPTQwMCZ1PTNiMWFmNjZlOTBkZDg1MWY0ZDdjMDk2ZWQ2YTJmYmI0YjllMTkwZGEKCi0tLQEAAAAAMLcmRQNpNjQAAApjb25maWdfcm93AQNhcGkDYXBpAAAAAgAAACBPTREyFGdldF9hY2NvdW50X3Jlc3BvbnNlAAAAWKFpojkHYXNzZXRbXQ=='
)
export const abi = ABI.from(abiBlob)
export namespace Types {
    @Struct.type('account')
    export class account extends Struct {
        @Struct.field(Name)
        declare account: Name
    }
    @Struct.type('token_definition')
    export class token_definition extends Struct {
        @Struct.field(Name)
        declare contract: Name
        @Struct.field(Asset.Symbol)
        declare symbol: Asset.Symbol
    }
    @Struct.type('balances')
    export class balances extends Struct {
        @Struct.field(Name)
        declare account: Name
        @Struct.field(token_definition, {array: true})
        declare tokens: token_definition[]
        @Struct.field('bool')
        declare zerobalances: boolean
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
}
export const TableMap = {
    config: Types.config_row,
}
export interface TableTypes {
    config: Types.config_row
}
export type RowType<T> = T extends keyof TableTypes ? TableTypes[T] : any
export type TableNames = keyof TableTypes
export namespace ActionParams {
    export namespace Type {
        export interface token_definition {
            contract: NameType
            symbol: Asset.SymbolType
        }
    }
    export interface account {
        account: NameType
    }
    export interface balances {
        account: NameType
        tokens: Type.token_definition[]
        zerobalances: boolean
    }
    export interface setconfig {
        system_contract: NameType
        system_contract_msig: NameType
        system_token_contract: NameType
        system_token_symbol: Asset.SymbolType
    }
}
export interface ActionNameParams {
    account: ActionParams.account
    balances: ActionParams.balances
    setconfig: ActionParams.setconfig
}
export type ActionNames = keyof ActionNameParams
export interface ActionReturnValues {
    account: Types.get_account_response
    balances: Asset[]
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
