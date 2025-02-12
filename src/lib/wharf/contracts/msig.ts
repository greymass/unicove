import type {Action, BytesType, Checksum256Type, NameType, UInt16Type} from '@wharfkit/antelope'
import {
    ABI,
    Blob,
    Bytes,
    Checksum256,
    Name,
    Struct,
    TimePoint,
    TimePointSec,
    UInt16,
    UInt32,
    UInt8,
    VarUInt,
} from '@wharfkit/antelope'
import type {ActionOptions, ContractArgs, PartialBy, Table} from '@wharfkit/contract'
import {Contract as BaseContract} from '@wharfkit/contract'
export const abiBlob = Blob.from(
    'DmVvc2lvOjphYmkvMS4yABAGYWN0aW9uAAQHYWNjb3VudARuYW1lBG5hbWUEbmFtZQ1hdXRob3JpemF0aW9uEnBlcm1pc3Npb25fbGV2ZWxbXQRkYXRhBWJ5dGVzCGFwcHJvdmFsAAIFbGV2ZWwQcGVybWlzc2lvbl9sZXZlbAR0aW1lCnRpbWVfcG9pbnQOYXBwcm92YWxzX2luZm8ABAd2ZXJzaW9uBXVpbnQ4DXByb3Bvc2FsX25hbWUEbmFtZRNyZXF1ZXN0ZWRfYXBwcm92YWxzCmFwcHJvdmFsW10ScHJvdmlkZWRfYXBwcm92YWxzCmFwcHJvdmFsW10HYXBwcm92ZQAECHByb3Bvc2VyBG5hbWUNcHJvcG9zYWxfbmFtZQRuYW1lBWxldmVsEHBlcm1pc3Npb25fbGV2ZWwNcHJvcG9zYWxfaGFzaAxjaGVja3N1bTI1NiQGY2FuY2VsAAMIcHJvcG9zZXIEbmFtZQ1wcm9wb3NhbF9uYW1lBG5hbWUIY2FuY2VsZXIEbmFtZQRleGVjAAMIcHJvcG9zZXIEbmFtZQ1wcm9wb3NhbF9uYW1lBG5hbWUIZXhlY3V0ZXIEbmFtZQlleHRlbnNpb24AAgR0eXBlBnVpbnQxNgRkYXRhBWJ5dGVzCmludmFsaWRhdGUAAQdhY2NvdW50BG5hbWUMaW52YWxpZGF0aW9uAAIHYWNjb3VudARuYW1lFmxhc3RfaW52YWxpZGF0aW9uX3RpbWUKdGltZV9wb2ludBJvbGRfYXBwcm92YWxzX2luZm8AAw1wcm9wb3NhbF9uYW1lBG5hbWUTcmVxdWVzdGVkX2FwcHJvdmFscxJwZXJtaXNzaW9uX2xldmVsW10ScHJvdmlkZWRfYXBwcm92YWxzEnBlcm1pc3Npb25fbGV2ZWxbXRBwZXJtaXNzaW9uX2xldmVsAAIFYWN0b3IEbmFtZQpwZXJtaXNzaW9uBG5hbWUIcHJvcG9zYWwAAw1wcm9wb3NhbF9uYW1lBG5hbWUScGFja2VkX3RyYW5zYWN0aW9uBWJ5dGVzEmVhcmxpZXN0X2V4ZWNfdGltZQx0aW1lX3BvaW50PyQHcHJvcG9zZQAECHByb3Bvc2VyBG5hbWUNcHJvcG9zYWxfbmFtZQRuYW1lCXJlcXVlc3RlZBJwZXJtaXNzaW9uX2xldmVsW10DdHJ4C3RyYW5zYWN0aW9uC3RyYW5zYWN0aW9uEnRyYW5zYWN0aW9uX2hlYWRlcgMUY29udGV4dF9mcmVlX2FjdGlvbnMIYWN0aW9uW10HYWN0aW9ucwhhY3Rpb25bXRZ0cmFuc2FjdGlvbl9leHRlbnNpb25zC2V4dGVuc2lvbltdEnRyYW5zYWN0aW9uX2hlYWRlcgAGCmV4cGlyYXRpb24OdGltZV9wb2ludF9zZWMNcmVmX2Jsb2NrX251bQZ1aW50MTYQcmVmX2Jsb2NrX3ByZWZpeAZ1aW50MzITbWF4X25ldF91c2FnZV93b3Jkcwl2YXJ1aW50MzIQbWF4X2NwdV91c2FnZV9tcwV1aW50OAlkZWxheV9zZWMJdmFydWludDMyCXVuYXBwcm92ZQADCHByb3Bvc2VyBG5hbWUNcHJvcG9zYWxfbmFtZQRuYW1lBWxldmVsEHBlcm1pc3Npb25fbGV2ZWwGAAAAQG16azUHYXBwcm92ZQAAAAAARIWmQQZjYW5jZWwAAAAAAACAVFcEZXhlYwAAgMomuWj2dAppbnZhbGlkYXRlAAAAAEBhWumtB3Byb3Bvc2UAAABQm95azdQJdW5hcHByb3ZlAAQAAMDRbHprNQNpNjQAABJvbGRfYXBwcm92YWxzX2luZm8AgMDRbHprNQNpNjQAAA5hcHByb3ZhbHNfaW5mbwAAAADgaPZ0A2k2NAAADGludmFsaWRhdGlvbgAAANFgWumtA2k2NAAACHByb3Bvc2FsAAAAAAA='
)
export const abi = ABI.from(abiBlob)
export namespace Types {
    @Struct.type('permission_level')
    export class permission_level extends Struct {
        @Struct.field(Name)
        declare actor: Name
        @Struct.field(Name)
        declare permission: Name
    }
    @Struct.type('action')
    export class action extends Struct {
        @Struct.field(Name)
        declare account: Name
        @Struct.field(Name)
        declare name: Name
        @Struct.field(permission_level, {array: true})
        declare authorization: permission_level[]
        @Struct.field(Bytes)
        declare data: Bytes
    }
    @Struct.type('approval')
    export class approval extends Struct {
        @Struct.field(permission_level)
        declare level: permission_level
        @Struct.field(TimePoint)
        declare time: TimePoint
    }
    @Struct.type('approvals_info')
    export class approvals_info extends Struct {
        @Struct.field(UInt8)
        declare version: UInt8
        @Struct.field(Name)
        declare proposal_name: Name
        @Struct.field(approval, {array: true})
        declare requested_approvals: approval[]
        @Struct.field(approval, {array: true})
        declare provided_approvals: approval[]
    }
    @Struct.type('approve')
    export class approve extends Struct {
        @Struct.field(Name)
        declare proposer: Name
        @Struct.field(Name)
        declare proposal_name: Name
        @Struct.field(permission_level)
        declare level: permission_level
        @Struct.field(Checksum256, {optional: true})
        declare proposal_hash?: Checksum256
    }
    @Struct.type('cancel')
    export class cancel extends Struct {
        @Struct.field(Name)
        declare proposer: Name
        @Struct.field(Name)
        declare proposal_name: Name
        @Struct.field(Name)
        declare canceler: Name
    }
    @Struct.type('exec')
    export class exec extends Struct {
        @Struct.field(Name)
        declare proposer: Name
        @Struct.field(Name)
        declare proposal_name: Name
        @Struct.field(Name)
        declare executer: Name
    }
    @Struct.type('extension')
    export class extension extends Struct {
        @Struct.field(UInt16)
        declare type: UInt16
        @Struct.field(Bytes)
        declare data: Bytes
    }
    @Struct.type('invalidate')
    export class invalidate extends Struct {
        @Struct.field(Name)
        declare account: Name
    }
    @Struct.type('invalidation')
    export class invalidation extends Struct {
        @Struct.field(Name)
        declare account: Name
        @Struct.field(TimePoint)
        declare last_invalidation_time: TimePoint
    }
    @Struct.type('old_approvals_info')
    export class old_approvals_info extends Struct {
        @Struct.field(Name)
        declare proposal_name: Name
        @Struct.field(permission_level, {array: true})
        declare requested_approvals: permission_level[]
        @Struct.field(permission_level, {array: true})
        declare provided_approvals: permission_level[]
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
    @Struct.type('transaction_header')
    export class transaction_header extends Struct {
        @Struct.field(TimePointSec)
        declare expiration: TimePointSec
        @Struct.field(UInt16)
        declare ref_block_num: UInt16
        @Struct.field(UInt32)
        declare ref_block_prefix: UInt32
        @Struct.field(VarUInt)
        declare max_net_usage_words: VarUInt
        @Struct.field(UInt8)
        declare max_cpu_usage_ms: UInt8
        @Struct.field(VarUInt)
        declare delay_sec: VarUInt
    }
    @Struct.type('transaction')
    export class transaction extends transaction_header {
        @Struct.field(action, {array: true})
        declare context_free_actions: action[]
        @Struct.field(action, {array: true})
        declare actions: action[]
        @Struct.field(extension, {array: true})
        declare transaction_extensions: extension[]
    }
    @Struct.type('propose')
    export class propose extends Struct {
        @Struct.field(Name)
        declare proposer: Name
        @Struct.field(Name)
        declare proposal_name: Name
        @Struct.field(permission_level, {array: true})
        declare requested: permission_level[]
        @Struct.field(transaction)
        declare trx: transaction
    }
    @Struct.type('unapprove')
    export class unapprove extends Struct {
        @Struct.field(Name)
        declare proposer: Name
        @Struct.field(Name)
        declare proposal_name: Name
        @Struct.field(permission_level)
        declare level: permission_level
    }
}
export const TableMap = {
    approvals: Types.old_approvals_info,
    approvals2: Types.approvals_info,
    invals: Types.invalidation,
    proposal: Types.proposal,
}
export interface TableTypes {
    approvals: Types.old_approvals_info
    approvals2: Types.approvals_info
    invals: Types.invalidation
    proposal: Types.proposal
}
export type RowType<T> = T extends keyof TableTypes ? TableTypes[T] : any
export type TableNames = keyof TableTypes
export namespace ActionParams {
    export namespace Type {
        export interface permission_level {
            actor: NameType
            permission: NameType
        }
        export interface transaction {
            context_free_actions: Type.action[]
            actions: Type.action[]
            transaction_extensions: Type.extension[]
        }
        export interface action {
            account: NameType
            name: NameType
            authorization: Type.permission_level[]
            data: BytesType
        }
        export interface extension {
            type: UInt16Type
            data: BytesType
        }
    }
    export interface approve {
        proposer: NameType
        proposal_name: NameType
        level: Type.permission_level
        proposal_hash?: Checksum256Type
    }
    export interface cancel {
        proposer: NameType
        proposal_name: NameType
        canceler: NameType
    }
    export interface exec {
        proposer: NameType
        proposal_name: NameType
        executer: NameType
    }
    export interface invalidate {
        account: NameType
    }
    export interface propose {
        proposer: NameType
        proposal_name: NameType
        requested: Type.permission_level[]
        trx: Type.transaction
    }
    export interface unapprove {
        proposer: NameType
        proposal_name: NameType
        level: Type.permission_level
    }
}
export interface ActionNameParams {
    approve: ActionParams.approve
    cancel: ActionParams.cancel
    exec: ActionParams.exec
    invalidate: ActionParams.invalidate
    propose: ActionParams.propose
    unapprove: ActionParams.unapprove
}
export type ActionNames = keyof ActionNameParams
export class Contract extends BaseContract {
    constructor(args: PartialBy<ContractArgs, 'abi' | 'account'>) {
        super({
            client: args.client,
            abi: abi,
            account: args.account || Name.from('eosio.msig'),
        })
    }
    action<T extends ActionNames>(
        name: T,
        data: ActionNameParams[T],
        options?: ActionOptions
    ): Action {
        return super.action(name, data, options)
    }
    table<T extends TableNames>(name: T, scope?: NameType): Table<RowType<T>> {
        return super.table(name, scope, TableMap[name])
    }
}
