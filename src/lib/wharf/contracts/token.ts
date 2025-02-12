import type {Action, AssetType, NameType} from '@wharfkit/antelope'
import {ABI, Asset, Blob, Name, Struct} from '@wharfkit/antelope'
import type {ActionOptions, ContractArgs, PartialBy, Table} from '@wharfkit/contract'
import {Contract as BaseContract} from '@wharfkit/contract'
export const abiBlob = Blob.from(
    'DmVvc2lvOjphYmkvMS4yAAgHYWNjb3VudAABB2JhbGFuY2UFYXNzZXQFY2xvc2UAAgVvd25lcgRuYW1lBnN5bWJvbAZzeW1ib2wGY3JlYXRlAAIGaXNzdWVyBG5hbWUObWF4aW11bV9zdXBwbHkFYXNzZXQOY3VycmVuY3lfc3RhdHMAAwZzdXBwbHkFYXNzZXQKbWF4X3N1cHBseQVhc3NldAZpc3N1ZXIEbmFtZQVpc3N1ZQADAnRvBG5hbWUIcXVhbnRpdHkFYXNzZXQEbWVtbwZzdHJpbmcEb3BlbgADBW93bmVyBG5hbWUGc3ltYm9sBnN5bWJvbAlyYW1fcGF5ZXIEbmFtZQZyZXRpcmUAAghxdWFudGl0eQVhc3NldARtZW1vBnN0cmluZwh0cmFuc2ZlcgAEBGZyb20EbmFtZQJ0bwRuYW1lCHF1YW50aXR5BWFzc2V0BG1lbW8Gc3RyaW5nBgAAAAAAhWlEBWNsb3Nl7gMtLS0Kc3BlY192ZXJzaW9uOiAiMC4yLjAiCnRpdGxlOiBDbG9zZSBUb2tlbiBCYWxhbmNlCnN1bW1hcnk6ICdDbG9zZSB7e25vd3JhcCBvd25lcn194oCZcyB6ZXJvIHF1YW50aXR5IGJhbGFuY2UnCmljb246IGh0dHBzOi8vcmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbS9BbnRlbG9wZUlPL3JlZmVyZW5jZS1jb250cmFjdHMvbWFpbi9jb250cmFjdHMvaWNvbnMvdG9rZW4ucG5nIzIwN2ZmNjhiMDQwNmVhYTU2NjE4YjA4YmRhODFkNmEwOTU0NTQzZjM2YWRjMzI4YWIzMDY1ZjMxYTVjNWQ2NTQKLS0tCgp7e293bmVyfX0gYWdyZWVzIHRvIGNsb3NlIHRoZWlyIHplcm8gcXVhbnRpdHkgYmFsYW5jZSBmb3IgdGhlIHt7c3ltYm9sX3RvX3N5bWJvbF9jb2RlIHN5bWJvbH19IHRva2VuLgoKUkFNIHdpbGwgYmUgcmVmdW5kZWQgdG8gdGhlIFJBTSBwYXllciBvZiB0aGUge3tzeW1ib2xfdG9fc3ltYm9sX2NvZGUgc3ltYm9sfX0gdG9rZW4gYmFsYW5jZSBmb3Ige3tvd25lcn19LgAAAACobNRFBmNyZWF0ZY8FLS0tCnNwZWNfdmVyc2lvbjogIjAuMi4wIgp0aXRsZTogQ3JlYXRlIE5ldyBUb2tlbgpzdW1tYXJ5OiAnQ3JlYXRlIGEgbmV3IHRva2VuJwppY29uOiBodHRwczovL3Jhdy5naXRodWJ1c2VyY29udGVudC5jb20vQW50ZWxvcGVJTy9yZWZlcmVuY2UtY29udHJhY3RzL21haW4vY29udHJhY3RzL2ljb25zL3Rva2VuLnBuZyMyMDdmZjY4YjA0MDZlYWE1NjYxOGIwOGJkYTgxZDZhMDk1NDU0M2YzNmFkYzMyOGFiMzA2NWYzMWE1YzVkNjU0Ci0tLQoKe3skYWN0aW9uLmFjY291bnR9fSBhZ3JlZXMgdG8gY3JlYXRlIGEgbmV3IHRva2VuIHdpdGggc3ltYm9sIHt7YXNzZXRfdG9fc3ltYm9sX2NvZGUgbWF4aW11bV9zdXBwbHl9fSB0byBiZSBtYW5hZ2VkIGJ5IHt7aXNzdWVyfX0uCgpUaGlzIGFjdGlvbiB3aWxsIG5vdCByZXN1bHQgYW55IGFueSB0b2tlbnMgYmVpbmcgaXNzdWVkIGludG8gY2lyY3VsYXRpb24uCgp7e2lzc3Vlcn19IHdpbGwgYmUgYWxsb3dlZCB0byBpc3N1ZSB0b2tlbnMgaW50byBjaXJjdWxhdGlvbiwgdXAgdG8gYSBtYXhpbXVtIHN1cHBseSBvZiB7e21heGltdW1fc3VwcGx5fX0uCgpSQU0gd2lsbCBkZWR1Y3RlZCBmcm9tIHt7JGFjdGlvbi5hY2NvdW50fX3igJlzIHJlc291cmNlcyB0byBjcmVhdGUgdGhlIG5lY2Vzc2FyeSByZWNvcmRzLgAAAAAApTF2BWlzc3Vl4wctLS0Kc3BlY192ZXJzaW9uOiAiMC4yLjAiCnRpdGxlOiBJc3N1ZSBUb2tlbnMgaW50byBDaXJjdWxhdGlvbgpzdW1tYXJ5OiAnSXNzdWUge3tub3dyYXAgcXVhbnRpdHl9fSBpbnRvIGNpcmN1bGF0aW9uIGFuZCB0cmFuc2ZlciBpbnRvIHt7bm93cmFwIHRvfX3igJlzIGFjY291bnQnCmljb246IGh0dHBzOi8vcmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbS9BbnRlbG9wZUlPL3JlZmVyZW5jZS1jb250cmFjdHMvbWFpbi9jb250cmFjdHMvaWNvbnMvdG9rZW4ucG5nIzIwN2ZmNjhiMDQwNmVhYTU2NjE4YjA4YmRhODFkNmEwOTU0NTQzZjM2YWRjMzI4YWIzMDY1ZjMxYTVjNWQ2NTQKLS0tCgpUaGUgdG9rZW4gbWFuYWdlciBhZ3JlZXMgdG8gaXNzdWUge3txdWFudGl0eX19IGludG8gY2lyY3VsYXRpb24sIGFuZCB0cmFuc2ZlciBpdCBpbnRvIHt7dG99feKAmXMgYWNjb3VudC4KCnt7I2lmIG1lbW99fVRoZXJlIGlzIGEgbWVtbyBhdHRhY2hlZCB0byB0aGUgdHJhbnNmZXIgc3RhdGluZzoKe3ttZW1vfX0Ke3svaWZ9fQoKSWYge3t0b319IGRvZXMgbm90IGhhdmUgYSBiYWxhbmNlIGZvciB7e2Fzc2V0X3RvX3N5bWJvbF9jb2RlIHF1YW50aXR5fX0sIG9yIHRoZSB0b2tlbiBtYW5hZ2VyIGRvZXMgbm90IGhhdmUgYSBiYWxhbmNlIGZvciB7e2Fzc2V0X3RvX3N5bWJvbF9jb2RlIHF1YW50aXR5fX0sIHRoZSB0b2tlbiBtYW5hZ2VyIHdpbGwgYmUgZGVzaWduYXRlZCBhcyB0aGUgUkFNIHBheWVyIG9mIHRoZSB7e2Fzc2V0X3RvX3N5bWJvbF9jb2RlIHF1YW50aXR5fX0gdG9rZW4gYmFsYW5jZSBmb3Ige3t0b319LiBBcyBhIHJlc3VsdCwgUkFNIHdpbGwgYmUgZGVkdWN0ZWQgZnJvbSB0aGUgdG9rZW4gbWFuYWdlcuKAmXMgcmVzb3VyY2VzIHRvIGNyZWF0ZSB0aGUgbmVjZXNzYXJ5IHJlY29yZHMuCgpUaGlzIGFjdGlvbiBkb2VzIG5vdCBhbGxvdyB0aGUgdG90YWwgcXVhbnRpdHkgdG8gZXhjZWVkIHRoZSBtYXggYWxsb3dlZCBzdXBwbHkgb2YgdGhlIHRva2VuLgAAAAAAMFWlBG9wZW67BS0tLQpzcGVjX3ZlcnNpb246ICIwLjIuMCIKdGl0bGU6IE9wZW4gVG9rZW4gQmFsYW5jZQpzdW1tYXJ5OiAnT3BlbiBhIHplcm8gcXVhbnRpdHkgYmFsYW5jZSBmb3Ige3tub3dyYXAgb3duZXJ9fScKaWNvbjogaHR0cHM6Ly9yYXcuZ2l0aHVidXNlcmNvbnRlbnQuY29tL0FudGVsb3BlSU8vcmVmZXJlbmNlLWNvbnRyYWN0cy9tYWluL2NvbnRyYWN0cy9pY29ucy90b2tlbi5wbmcjMjA3ZmY2OGIwNDA2ZWFhNTY2MThiMDhiZGE4MWQ2YTA5NTQ1NDNmMzZhZGMzMjhhYjMwNjVmMzFhNWM1ZDY1NAotLS0KCnt7cmFtX3BheWVyfX0gYWdyZWVzIHRvIGVzdGFibGlzaCBhIHplcm8gcXVhbnRpdHkgYmFsYW5jZSBmb3Ige3tvd25lcn19IGZvciB0aGUge3tzeW1ib2xfdG9fc3ltYm9sX2NvZGUgc3ltYm9sfX0gdG9rZW4uCgpJZiB7e293bmVyfX0gZG9lcyBub3QgaGF2ZSBhIGJhbGFuY2UgZm9yIHt7c3ltYm9sX3RvX3N5bWJvbF9jb2RlIHN5bWJvbH19LCB7e3JhbV9wYXllcn19IHdpbGwgYmUgZGVzaWduYXRlZCBhcyB0aGUgUkFNIHBheWVyIG9mIHRoZSB7e3N5bWJvbF90b19zeW1ib2xfY29kZSBzeW1ib2x9fSB0b2tlbiBiYWxhbmNlIGZvciB7e293bmVyfX0uIEFzIGEgcmVzdWx0LCBSQU0gd2lsbCBiZSBkZWR1Y3RlZCBmcm9tIHt7cmFtX3BheWVyfX3igJlzIHJlc291cmNlcyB0byBjcmVhdGUgdGhlIG5lY2Vzc2FyeSByZWNvcmRzLgAAAACo67K6BnJldGlyZdEDLS0tCnNwZWNfdmVyc2lvbjogIjAuMi4wIgp0aXRsZTogUmVtb3ZlIFRva2VucyBmcm9tIENpcmN1bGF0aW9uCnN1bW1hcnk6ICdSZW1vdmUge3tub3dyYXAgcXVhbnRpdHl9fSBmcm9tIGNpcmN1bGF0aW9uJwppY29uOiBodHRwczovL3Jhdy5naXRodWJ1c2VyY29udGVudC5jb20vQW50ZWxvcGVJTy9yZWZlcmVuY2UtY29udHJhY3RzL21haW4vY29udHJhY3RzL2ljb25zL3Rva2VuLnBuZyMyMDdmZjY4YjA0MDZlYWE1NjYxOGIwOGJkYTgxZDZhMDk1NDU0M2YzNmFkYzMyOGFiMzA2NWYzMWE1YzVkNjU0Ci0tLQoKVGhlIHRva2VuIG1hbmFnZXIgYWdyZWVzIHRvIHJlbW92ZSB7e3F1YW50aXR5fX0gZnJvbSBjaXJjdWxhdGlvbiwgdGFrZW4gZnJvbSB0aGVpciBvd24gYWNjb3VudC4KCnt7I2lmIG1lbW99fSBUaGVyZSBpcyBhIG1lbW8gYXR0YWNoZWQgdG8gdGhlIGFjdGlvbiBzdGF0aW5nOgp7e21lbW99fQp7ey9pZn19AAAAVy08zc0IdHJhbnNmZXKrBy0tLQpzcGVjX3ZlcnNpb246ICIwLjIuMCIKdGl0bGU6IFRyYW5zZmVyIFRva2VucwpzdW1tYXJ5OiAnU2VuZCB7e25vd3JhcCBxdWFudGl0eX19IGZyb20ge3tub3dyYXAgZnJvbX19IHRvIHt7bm93cmFwIHRvfX0nCmljb246IGh0dHBzOi8vcmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbS9BbnRlbG9wZUlPL3JlZmVyZW5jZS1jb250cmFjdHMvbWFpbi9jb250cmFjdHMvaWNvbnMvdHJhbnNmZXIucG5nIzVkZmFkMGRmNzI3NzJlZTFjY2MxNTVlNjcwYzFkMTI0ZjVjNTEyMmYxZDUwMjc1NjVkZjM4YjQxODA0MmQxZGQKLS0tCgp7e2Zyb219fSBhZ3JlZXMgdG8gc2VuZCB7e3F1YW50aXR5fX0gdG8ge3t0b319LgoKe3sjaWYgbWVtb319VGhlcmUgaXMgYSBtZW1vIGF0dGFjaGVkIHRvIHRoZSB0cmFuc2ZlciBzdGF0aW5nOgp7e21lbW99fQp7ey9pZn19CgpJZiB7e2Zyb219fSBpcyBub3QgYWxyZWFkeSB0aGUgUkFNIHBheWVyIG9mIHRoZWlyIHt7YXNzZXRfdG9fc3ltYm9sX2NvZGUgcXVhbnRpdHl9fSB0b2tlbiBiYWxhbmNlLCB7e2Zyb219fSB3aWxsIGJlIGRlc2lnbmF0ZWQgYXMgc3VjaC4gQXMgYSByZXN1bHQsIFJBTSB3aWxsIGJlIGRlZHVjdGVkIGZyb20ge3tmcm9tfX3igJlzIHJlc291cmNlcyB0byByZWZ1bmQgdGhlIG9yaWdpbmFsIFJBTSBwYXllci4KCklmIHt7dG99fSBkb2VzIG5vdCBoYXZlIGEgYmFsYW5jZSBmb3Ige3thc3NldF90b19zeW1ib2xfY29kZSBxdWFudGl0eX19LCB7e2Zyb219fSB3aWxsIGJlIGRlc2lnbmF0ZWQgYXMgdGhlIFJBTSBwYXllciBvZiB0aGUge3thc3NldF90b19zeW1ib2xfY29kZSBxdWFudGl0eX19IHRva2VuIGJhbGFuY2UgZm9yIHt7dG99fS4gQXMgYSByZXN1bHQsIFJBTSB3aWxsIGJlIGRlZHVjdGVkIGZyb20ge3tmcm9tfX3igJlzIHJlc291cmNlcyB0byBjcmVhdGUgdGhlIG5lY2Vzc2FyeSByZWNvcmRzLgIAAAA4T00RMgNpNjQAAAdhY2NvdW50AAAAAACQTcYDaTY0AAAOY3VycmVuY3lfc3RhdHMAAAAAAA=='
)
export const abi = ABI.from(abiBlob)
export namespace Types {
    @Struct.type('account')
    export class account extends Struct {
        @Struct.field(Asset)
        declare balance: Asset
    }
    @Struct.type('close')
    export class close extends Struct {
        @Struct.field(Name)
        declare owner: Name
        @Struct.field(Asset.Symbol)
        declare symbol: Asset.Symbol
    }
    @Struct.type('create')
    export class create extends Struct {
        @Struct.field(Name)
        declare issuer: Name
        @Struct.field(Asset)
        declare maximum_supply: Asset
    }
    @Struct.type('currency_stats')
    export class currency_stats extends Struct {
        @Struct.field(Asset)
        declare supply: Asset
        @Struct.field(Asset)
        declare max_supply: Asset
        @Struct.field(Name)
        declare issuer: Name
    }
    @Struct.type('issue')
    export class issue extends Struct {
        @Struct.field(Name)
        declare to: Name
        @Struct.field(Asset)
        declare quantity: Asset
        @Struct.field('string')
        declare memo: string
    }
    @Struct.type('open')
    export class open extends Struct {
        @Struct.field(Name)
        declare owner: Name
        @Struct.field(Asset.Symbol)
        declare symbol: Asset.Symbol
        @Struct.field(Name)
        declare ram_payer: Name
    }
    @Struct.type('retire')
    export class retire extends Struct {
        @Struct.field(Asset)
        declare quantity: Asset
        @Struct.field('string')
        declare memo: string
    }
    @Struct.type('transfer')
    export class transfer extends Struct {
        @Struct.field(Name)
        declare from: Name
        @Struct.field(Name)
        declare to: Name
        @Struct.field(Asset)
        declare quantity: Asset
        @Struct.field('string')
        declare memo: string
    }
}
export const TableMap = {
    accounts: Types.account,
    stat: Types.currency_stats,
}
export interface TableTypes {
    accounts: Types.account
    stat: Types.currency_stats
}
export type RowType<T> = T extends keyof TableTypes ? TableTypes[T] : any
export type TableNames = keyof TableTypes
export namespace ActionParams {
    export namespace Type {}
    export interface close {
        owner: NameType
        symbol: Asset.SymbolType
    }
    export interface create {
        issuer: NameType
        maximum_supply: AssetType
    }
    export interface issue {
        to: NameType
        quantity: AssetType
        memo: string
    }
    export interface open {
        owner: NameType
        symbol: Asset.SymbolType
        ram_payer: NameType
    }
    export interface retire {
        quantity: AssetType
        memo: string
    }
    export interface transfer {
        from: NameType
        to: NameType
        quantity: AssetType
        memo: string
    }
}
export interface ActionNameParams {
    close: ActionParams.close
    create: ActionParams.create
    issue: ActionParams.issue
    open: ActionParams.open
    retire: ActionParams.retire
    transfer: ActionParams.transfer
}
export type ActionNames = keyof ActionNameParams
export class Contract extends BaseContract {
    constructor(args: PartialBy<ContractArgs, 'abi' | 'account'>) {
        super({
            client: args.client,
            abi: abi,
            account: args.account || Name.from('eosio.token'),
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
