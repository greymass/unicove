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
    'DmVvc2lvOjphYmkvMS4yAAoKY2xlYXJ0YWJsZQADCnRhYmxlX25hbWUEbmFtZQVzY29wZQVuYW1lPwhtYXhfcm93cwd1aW50NjQ/E2RlbGVnYXRlZF9iYW5kd2lkdGgABARmcm9tBG5hbWUCdG8EbmFtZQpuZXRfd2VpZ2h0BWFzc2V0CmNwdV93ZWlnaHQFYXNzZXQUZ2V0X2FjY291bnRfcmVzcG9uc2UABwdhY2NvdW50BG5hbWUHYmFsYW5jZQVhc3NldAtkZWxlZ2F0aW9ucxVkZWxlZ2F0ZWRfYmFuZHdpZHRoW10JcHJvcG9zYWxzCnByb3Bvc2FsW10GcmVmdW5kDnJlZnVuZF9yZXF1ZXN0BnJleGJhbAtyZXhfYmFsYW5jZQdyZXhmdW5kCHJleF9mdW5kCmdldGFjY291bnQAAQdhY2NvdW50BG5hbWUZcGFpcl90aW1lX3BvaW50X3NlY19pbnQ2NAACBWZpcnN0DnRpbWVfcG9pbnRfc2VjBnNlY29uZAVpbnQ2NAhwcm9wb3NhbAADDXByb3Bvc2FsX25hbWUEbmFtZRJwYWNrZWRfdHJhbnNhY3Rpb24FYnl0ZXMSZWFybGllc3RfZXhlY190aW1lDHRpbWVfcG9pbnQ/JA5yZWZ1bmRfcmVxdWVzdAAEBW93bmVyBG5hbWUMcmVxdWVzdF90aW1lDnRpbWVfcG9pbnRfc2VjCm5ldF9hbW91bnQFYXNzZXQKY3B1X2Ftb3VudAVhc3NldAtyZXhfYmFsYW5jZQAGB3ZlcnNpb24FdWludDgFb3duZXIEbmFtZQp2b3RlX3N0YWtlBWFzc2V0C3JleF9iYWxhbmNlBWFzc2V0C21hdHVyZWRfcmV4BWludDY0DnJleF9tYXR1cml0aWVzG3BhaXJfdGltZV9wb2ludF9zZWNfaW50NjRbXQhyZXhfZnVuZAADB3ZlcnNpb24FdWludDgFb3duZXIEbmFtZQdiYWxhbmNlBWFzc2V0BHdpcGUAAAMAgIrH5GtURApjbGVhcnRhYmxlvgEtLS0KCnNwZWNfdmVyc2lvbjogIjAuMi4wIgp0aXRsZTogY2xlYXJ0YWJsZQpzdW1tYXJ5OiAnREVCVUc6IGNsZWFydGFibGUgYWN0aW9uJwppY29uOiBodHRwczovL2F2YXRhcnMuZ2l0aHVidXNlcmNvbnRlbnQuY29tL3UvMTQ3MjkyODYxP3M9NDAwJnU9M2IxYWY2NmU5MGRkODUxZjRkN2MwOTZlZDZhMmZiYjRiOWUxOTBkYQoKLS0tAECemiJksmIKZ2V0YWNjb3VudMcBLS0tCgpzcGVjX3ZlcnNpb246ICIwLjIuMCIKdGl0bGU6IGdldGFjY291bnQKc3VtbWFyeTogJ1JlYWQtb25seSBBUEkgdG8gZ2V0IGFjY291bnQgZGF0YScKaWNvbjogaHR0cHM6Ly9hdmF0YXJzLmdpdGh1YnVzZXJjb250ZW50LmNvbS91LzE0NzI5Mjg2MT9zPTQwMCZ1PTNiMWFmNjZlOTBkZDg1MWY0ZDdjMDk2ZWQ2YTJmYmI0YjllMTkwZGEKCi0tLQAAAAAAoKrjBHdpcGWyAS0tLQoKc3BlY192ZXJzaW9uOiAiMC4yLjAiCnRpdGxlOiB3aXBlCnN1bW1hcnk6ICdERUJVRzogd2lwZSBhY3Rpb24nCmljb246IGh0dHBzOi8vYXZhdGFycy5naXRodWJ1c2VyY29udGVudC5jb20vdS8xNDcyOTI4NjE/cz00MDAmdT0zYjFhZjY2ZTkwZGQ4NTFmNGQ3YzA5NmVkNmEyZmJiNGI5ZTE5MGRhCgotLS0AAQNhcGkDYXBpAAAAAQBAnpoiZLJiFGdldF9hY2NvdW50X3Jlc3BvbnNl'
)
export const abi = ABI.from(abiBlob)
export namespace Types {
    @Struct.type('cleartable')
    export class cleartable extends Struct {
        @Struct.field(Name)
        declare table_name: Name
        @Struct.field(Name, {optional: true})
        declare scope?: Name
        @Struct.field(UInt64, {optional: true})
        declare max_rows?: UInt64
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
    @Struct.type('wipe')
    export class wipe extends Struct {}
}
export const TableMap = {}
export interface TableTypes {}
export type RowType<T> = T extends keyof TableTypes ? TableTypes[T] : any
export type TableNames = keyof TableTypes
export namespace ActionParams {
    export namespace Type {}
    export interface cleartable {
        table_name: NameType
        scope?: NameType
        max_rows?: UInt64Type
    }
    export interface getaccount {
        account: NameType
    }
    export interface wipe {}
}
export interface ActionNameParams {
    cleartable: ActionParams.cleartable
    getaccount: ActionParams.getaccount
    wipe: ActionParams.wipe
}
export type ActionNames = keyof ActionNameParams
export interface ActionReturnValues {
    getaccount: Types.get_account_response
}
export type ActionReturnNames = keyof ActionReturnValues
export class Contract extends BaseContract {
    constructor(args: PartialBy<ContractArgs, 'abi' | 'account'>) {
        super({
            client: args.client,
            abi: abi,
            account: args.account || Name.from('api.gm'),
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
}
