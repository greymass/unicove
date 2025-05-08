import type { Action, AssetType, Int64Type, NameType } from '@wharfkit/antelope';
import { ABI, Asset, Blob, Int64, Name, Struct } from '@wharfkit/antelope';
import type { ActionOptions, ContractArgs, PartialBy, Table } from '@wharfkit/contract';
import { Contract as BaseContract } from '@wharfkit/contract';
export const abiBlob = Blob.from(
	'DmVvc2lvOjphYmkvMS4yAAwHYWNjb3VudAABB2JhbGFuY2UFYXNzZXQJYWRkZWdyZXNzAAEIYWNjb3VudHMGbmFtZVtdBWNsb3NlAAIFb3duZXIEbmFtZQZzeW1ib2wGc3ltYm9sBmNyZWF0ZQACBmlzc3VlcgRuYW1lDm1heGltdW1fc3VwcGx5BWFzc2V0DmN1cnJlbmN5X3N0YXRzAAMGc3VwcGx5BWFzc2V0Cm1heF9zdXBwbHkFYXNzZXQGaXNzdWVyBG5hbWUOZWdyZXNzbGlzdF9yb3cAAQdhY2NvdW50BG5hbWUFaXNzdWUAAwJ0bwRuYW1lCHF1YW50aXR5BWFzc2V0BG1lbW8Gc3RyaW5nBG9wZW4AAwVvd25lcgRuYW1lBnN5bWJvbAZzeW1ib2wJcmFtX3BheWVyBG5hbWUMcmVtb3ZlZWdyZXNzAAEIYWNjb3VudHMGbmFtZVtdBnJldGlyZQACCHF1YW50aXR5BWFzc2V0BG1lbW8Gc3RyaW5nCHRyYW5zZmVyAAQEZnJvbQRuYW1lAnRvBG5hbWUIcXVhbnRpdHkFYXNzZXQEbWVtbwZzdHJpbmcGdW53cmFwAAIFb3duZXIEbmFtZQVieXRlcwVpbnQ2NAkAAMBYXaZSMglhZGRlZ3Jlc3OGAi0tLQpzcGVjX3ZlcnNpb246ICIwLjIuMCIKdGl0bGU6IEFkZCBlZ3Jlc3MgYWNjb3VudHMKc3VtbWFyeTogJ0FkZCB7e25vd3JhcCBhY2NvdW50c3194oCZcyB0byBlZ3Jlc3MgbGlzdCcKaWNvbjogaHR0cHM6Ly9nYXRld2F5LnBpbmF0YS5jbG91ZC9pcGZzL1FtWjRIU1pEdVNyWjRCSGF3dFpSaFZmd3lZSjREZXBOSnFWRHp4WTU5S3ZlaU0jMzgzMGYxY2U4Y2IwN2Y3NzU3ZGJjZjM4M2IxZWMxYjExOTE0YWMzNGExZjlkOGIwNjVmMDc2MDBmYTlkYWMxOQotLS0AAAAAAIVpRAVjbG9zZd8DLS0tCnNwZWNfdmVyc2lvbjogIjAuMi4wIgp0aXRsZTogQ2xvc2UgVG9rZW4gQmFsYW5jZQpzdW1tYXJ5OiAnQ2xvc2Uge3tub3dyYXAgb3duZXJ9feKAmXMgemVybyBxdWFudGl0eSBiYWxhbmNlJwppY29uOiBodHRwczovL2dhdGV3YXkucGluYXRhLmNsb3VkL2lwZnMvUW1aNEhTWkR1U3JaNEJIYXd0WlJoVmZ3eVlKNERlcE5KcVZEenhZNTlLdmVpTSMzODMwZjFjZThjYjA3Zjc3NTdkYmNmMzgzYjFlYzFiMTE5MTRhYzM0YTFmOWQ4YjA2NWYwNzYwMGZhOWRhYzE5Ci0tLQoKe3tvd25lcn19IGFncmVlcyB0byBjbG9zZSB0aGVpciB6ZXJvIHF1YW50aXR5IGJhbGFuY2UgZm9yIHRoZSB7e3N5bWJvbF90b19zeW1ib2xfY29kZSBzeW1ib2x9fSB0b2tlbi4KClJBTSB3aWxsIGJlIHJlZnVuZGVkIHRvIHRoZSBSQU0gcGF5ZXIgb2YgdGhlIHt7c3ltYm9sX3RvX3N5bWJvbF9jb2RlIHN5bWJvbH19IHRva2VuIGJhbGFuY2UgZm9yIHt7b3duZXJ9fS4AAAAAqGzURQZjcmVhdGWABS0tLQpzcGVjX3ZlcnNpb246ICIwLjIuMCIKdGl0bGU6IENyZWF0ZSBOZXcgVG9rZW4Kc3VtbWFyeTogJ0NyZWF0ZSBhIG5ldyB0b2tlbicKaWNvbjogaHR0cHM6Ly9nYXRld2F5LnBpbmF0YS5jbG91ZC9pcGZzL1FtWjRIU1pEdVNyWjRCSGF3dFpSaFZmd3lZSjREZXBOSnFWRHp4WTU5S3ZlaU0jMzgzMGYxY2U4Y2IwN2Y3NzU3ZGJjZjM4M2IxZWMxYjExOTE0YWMzNGExZjlkOGIwNjVmMDc2MDBmYTlkYWMxOQotLS0KCnt7JGFjdGlvbi5hY2NvdW50fX0gYWdyZWVzIHRvIGNyZWF0ZSBhIG5ldyB0b2tlbiB3aXRoIHN5bWJvbCB7e2Fzc2V0X3RvX3N5bWJvbF9jb2RlIG1heGltdW1fc3VwcGx5fX0gdG8gYmUgbWFuYWdlZCBieSB7e2lzc3Vlcn19LgoKVGhpcyBhY3Rpb24gd2lsbCBub3QgcmVzdWx0IGFueSBhbnkgdG9rZW5zIGJlaW5nIGlzc3VlZCBpbnRvIGNpcmN1bGF0aW9uLgoKe3tpc3N1ZXJ9fSB3aWxsIGJlIGFsbG93ZWQgdG8gaXNzdWUgdG9rZW5zIGludG8gY2lyY3VsYXRpb24sIHVwIHRvIGEgbWF4aW11bSBzdXBwbHkgb2Yge3ttYXhpbXVtX3N1cHBseX19LgoKUkFNIHdpbGwgZGVkdWN0ZWQgZnJvbSB7eyRhY3Rpb24uYWNjb3VudH194oCZcyByZXNvdXJjZXMgdG8gY3JlYXRlIHRoZSBuZWNlc3NhcnkgcmVjb3Jkcy4AAAAAAKUxdgVpc3N1ZdQHLS0tCnNwZWNfdmVyc2lvbjogIjAuMi4wIgp0aXRsZTogSXNzdWUgVG9rZW5zIGludG8gQ2lyY3VsYXRpb24Kc3VtbWFyeTogJ0lzc3VlIHt7bm93cmFwIHF1YW50aXR5fX0gaW50byBjaXJjdWxhdGlvbiBhbmQgdHJhbnNmZXIgaW50byB7e25vd3JhcCB0b3194oCZcyBhY2NvdW50JwppY29uOiBodHRwczovL2dhdGV3YXkucGluYXRhLmNsb3VkL2lwZnMvUW1aNEhTWkR1U3JaNEJIYXd0WlJoVmZ3eVlKNERlcE5KcVZEenhZNTlLdmVpTSMzODMwZjFjZThjYjA3Zjc3NTdkYmNmMzgzYjFlYzFiMTE5MTRhYzM0YTFmOWQ4YjA2NWYwNzYwMGZhOWRhYzE5Ci0tLQoKVGhlIHRva2VuIG1hbmFnZXIgYWdyZWVzIHRvIGlzc3VlIHt7cXVhbnRpdHl9fSBpbnRvIGNpcmN1bGF0aW9uLCBhbmQgdHJhbnNmZXIgaXQgaW50byB7e3RvfX3igJlzIGFjY291bnQuCgp7eyNpZiBtZW1vfX1UaGVyZSBpcyBhIG1lbW8gYXR0YWNoZWQgdG8gdGhlIHRyYW5zZmVyIHN0YXRpbmc6Cnt7bWVtb319Cnt7L2lmfX0KCklmIHt7dG99fSBkb2VzIG5vdCBoYXZlIGEgYmFsYW5jZSBmb3Ige3thc3NldF90b19zeW1ib2xfY29kZSBxdWFudGl0eX19LCBvciB0aGUgdG9rZW4gbWFuYWdlciBkb2VzIG5vdCBoYXZlIGEgYmFsYW5jZSBmb3Ige3thc3NldF90b19zeW1ib2xfY29kZSBxdWFudGl0eX19LCB0aGUgdG9rZW4gbWFuYWdlciB3aWxsIGJlIGRlc2lnbmF0ZWQgYXMgdGhlIFJBTSBwYXllciBvZiB0aGUge3thc3NldF90b19zeW1ib2xfY29kZSBxdWFudGl0eX19IHRva2VuIGJhbGFuY2UgZm9yIHt7dG99fS4gQXMgYSByZXN1bHQsIFJBTSB3aWxsIGJlIGRlZHVjdGVkIGZyb20gdGhlIHRva2VuIG1hbmFnZXLigJlzIHJlc291cmNlcyB0byBjcmVhdGUgdGhlIG5lY2Vzc2FyeSByZWNvcmRzLgoKVGhpcyBhY3Rpb24gZG9lcyBub3QgYWxsb3cgdGhlIHRvdGFsIHF1YW50aXR5IHRvIGV4Y2VlZCB0aGUgbWF4IGFsbG93ZWQgc3VwcGx5IG9mIHRoZSB0b2tlbi4AAAAAADBVpQRvcGVurAUtLS0Kc3BlY192ZXJzaW9uOiAiMC4yLjAiCnRpdGxlOiBPcGVuIFRva2VuIEJhbGFuY2UKc3VtbWFyeTogJ09wZW4gYSB6ZXJvIHF1YW50aXR5IGJhbGFuY2UgZm9yIHt7bm93cmFwIG93bmVyfX0nCmljb246IGh0dHBzOi8vZ2F0ZXdheS5waW5hdGEuY2xvdWQvaXBmcy9RbVo0SFNaRHVTclo0Qkhhd3RaUmhWZnd5WUo0RGVwTkpxVkR6eFk1OUt2ZWlNIzM4MzBmMWNlOGNiMDdmNzc1N2RiY2YzODNiMWVjMWIxMTkxNGFjMzRhMWY5ZDhiMDY1ZjA3NjAwZmE5ZGFjMTkKLS0tCgp7e3JhbV9wYXllcn19IGFncmVlcyB0byBlc3RhYmxpc2ggYSB6ZXJvIHF1YW50aXR5IGJhbGFuY2UgZm9yIHt7b3duZXJ9fSBmb3IgdGhlIHt7c3ltYm9sX3RvX3N5bWJvbF9jb2RlIHN5bWJvbH19IHRva2VuLgoKSWYge3tvd25lcn19IGRvZXMgbm90IGhhdmUgYSBiYWxhbmNlIGZvciB7e3N5bWJvbF90b19zeW1ib2xfY29kZSBzeW1ib2x9fSwge3tyYW1fcGF5ZXJ9fSB3aWxsIGJlIGRlc2lnbmF0ZWQgYXMgdGhlIFJBTSBwYXllciBvZiB0aGUge3tzeW1ib2xfdG9fc3ltYm9sX2NvZGUgc3ltYm9sfX0gdG9rZW4gYmFsYW5jZSBmb3Ige3tvd25lcn19LiBBcyBhIHJlc3VsdCwgUkFNIHdpbGwgYmUgZGVkdWN0ZWQgZnJvbSB7e3JhbV9wYXllcn194oCZcyByZXNvdXJjZXMgdG8gY3JlYXRlIHRoZSBuZWNlc3NhcnkgcmVjb3Jkcy6AsbpMqU2lugxyZW1vdmVlZ3Jlc3OMAi0tLQpzcGVjX3ZlcnNpb246ICIwLjIuMCIKdGl0bGU6IFJlbW92ZSBlZ3Jlc3MgYWNjb3VudHMKc3VtbWFyeTogJ1JlbW92ZSB7e25vd3JhcCBhY2NvdW50c3194oCZcyB0byBlZ3Jlc3MgbGlzdCcKaWNvbjogaHR0cHM6Ly9nYXRld2F5LnBpbmF0YS5jbG91ZC9pcGZzL1FtWjRIU1pEdVNyWjRCSGF3dFpSaFZmd3lZSjREZXBOSnFWRHp4WTU5S3ZlaU0jMzgzMGYxY2U4Y2IwN2Y3NzU3ZGJjZjM4M2IxZWMxYjExOTE0YWMzNGExZjlkOGIwNjVmMDc2MDBmYTlkYWMxOQotLS0AAAAAqOuyugZyZXRpcmXCAy0tLQpzcGVjX3ZlcnNpb246ICIwLjIuMCIKdGl0bGU6IFJlbW92ZSBUb2tlbnMgZnJvbSBDaXJjdWxhdGlvbgpzdW1tYXJ5OiAnUmVtb3ZlIHt7bm93cmFwIHF1YW50aXR5fX0gZnJvbSBjaXJjdWxhdGlvbicKaWNvbjogaHR0cHM6Ly9nYXRld2F5LnBpbmF0YS5jbG91ZC9pcGZzL1FtWjRIU1pEdVNyWjRCSGF3dFpSaFZmd3lZSjREZXBOSnFWRHp4WTU5S3ZlaU0jMzgzMGYxY2U4Y2IwN2Y3NzU3ZGJjZjM4M2IxZWMxYjExOTE0YWMzNGExZjlkOGIwNjVmMDc2MDBmYTlkYWMxOQotLS0KClRoZSB0b2tlbiBtYW5hZ2VyIGFncmVlcyB0byByZW1vdmUge3txdWFudGl0eX19IGZyb20gY2lyY3VsYXRpb24sIHRha2VuIGZyb20gdGhlaXIgb3duIGFjY291bnQuCgp7eyNpZiBtZW1vfX0gVGhlcmUgaXMgYSBtZW1vIGF0dGFjaGVkIHRvIHRoZSBhY3Rpb24gc3RhdGluZzoKe3ttZW1vfX0Ke3svaWZ9fQAAAFctPM3NCHRyYW5zZmVymQctLS0Kc3BlY192ZXJzaW9uOiAiMC4yLjAiCnRpdGxlOiBUcmFuc2ZlciBUb2tlbnMKc3VtbWFyeTogJ1NlbmQge3tub3dyYXAgcXVhbnRpdHl9fSBmcm9tIHt7bm93cmFwIGZyb219fSB0byB7e25vd3JhcCB0b319JwppY29uOiBodHRwczovL2dhdGV3YXkucGluYXRhLmNsb3VkL2lwZnMvUW1aNEhTWkR1U3JaNEJIYXd0WlJoVmZ3eVlKNERlcE5KcVZEenhZNTlLdmVpTSMzODMwZjFjZThjYjA3Zjc3NTdkYmNmMzgzYjFlYzFiMTE5MTRhYzM0YTFmOWQ4YjA2NWYwNzYwMGZhOWRhYzE5Ci0tLQoKe3tmcm9tfX0gYWdyZWVzIHRvIHNlbmQge3txdWFudGl0eX19IHRvIHt7dG99fS4KCnt7I2lmIG1lbW99fVRoZXJlIGlzIGEgbWVtbyBhdHRhY2hlZCB0byB0aGUgdHJhbnNmZXIgc3RhdGluZzoKe3ttZW1vfX0Ke3svaWZ9fQoKSWYge3tmcm9tfX0gaXMgbm90IGFscmVhZHkgdGhlIFJBTSBwYXllciBvZiB0aGVpciB7e2Fzc2V0X3RvX3N5bWJvbF9jb2RlIHF1YW50aXR5fX0gdG9rZW4gYmFsYW5jZSwge3tmcm9tfX0gd2lsbCBiZSBkZXNpZ25hdGVkIGFzIHN1Y2guIEFzIGEgcmVzdWx0LCBSQU0gd2lsbCBiZSBkZWR1Y3RlZCBmcm9tIHt7ZnJvbX194oCZcyByZXNvdXJjZXMgdG8gcmVmdW5kIHRoZSBvcmlnaW5hbCBSQU0gcGF5ZXIuCgpJZiB7e3RvfX0gZG9lcyBub3QgaGF2ZSBhIGJhbGFuY2UgZm9yIHt7YXNzZXRfdG9fc3ltYm9sX2NvZGUgcXVhbnRpdHl9fSwge3tmcm9tfX0gd2lsbCBiZSBkZXNpZ25hdGVkIGFzIHRoZSBSQU0gcGF5ZXIgb2YgdGhlIHt7YXNzZXRfdG9fc3ltYm9sX2NvZGUgcXVhbnRpdHl9fSB0b2tlbiBiYWxhbmNlIGZvciB7e3RvfX0uIEFzIGEgcmVzdWx0LCBSQU0gd2lsbCBiZSBkZWR1Y3RlZCBmcm9tIHt7ZnJvbX194oCZcyByZXNvdXJjZXMgdG8gY3JlYXRlIHRoZSBuZWNlc3NhcnkgcmVjb3Jkcy4AAAAAVHP51AZ1bndyYXCPAi0tLQpzcGVjX3ZlcnNpb246ICIwLjIuMCIKdGl0bGU6IFVud3JhcCBXUkFNCnN1bW1hcnk6ICdVbndyYXAge3tub3dyYXAgYnl0ZXN9fSBieXRlcyBmcm9tIHt7bm93cmFwIG93bmVyfX0gYWNjb3VudCcKaWNvbjogaHR0cHM6Ly9nYXRld2F5LnBpbmF0YS5jbG91ZC9pcGZzL1FtWjRIU1pEdVNyWjRCSGF3dFpSaFZmd3lZSjREZXBOSnFWRHp4WTU5S3ZlaU0jMzgzMGYxY2U4Y2IwN2Y3NzU3ZGJjZjM4M2IxZWMxYjExOTE0YWMzNGExZjlkOGIwNjVmMDc2MDBmYTlkYWMxOQotLS0DAAAAOE9NETIDaTY0AAAHYWNjb3VudABAxi5irC5TA2k2NAAADmVncmVzc2xpc3Rfcm93AAAAAACQTcYDaTY0AAAOY3VycmVuY3lfc3RhdHMBDVVzZXJBZ3JlZW1lbnSZAVRoZSBgZW9zaW8ud3JhbWAgY29udHJhY3QgaXMgYSBjb250cmFjdCB0aGF0IGFsbG93cyB0byB3cmFwICYgdW53cmFwIHN5c3RlbSBSQU0gYnl0ZXMgYXQgMToxIHVzaW5nIHRoZSBgcmFtdHJhbnNmZXJgIG9yIGBidXlyYW1gICYgYGJ1eXJhbWJ5dGVzYCBhY3Rpb25zLgAAAAA='
);
export const abi = ABI.from(abiBlob);
export namespace Types {
	@Struct.type('account')
	export class account extends Struct {
		@Struct.field(Asset)
		declare balance: Asset;
	}
	@Struct.type('addegress')
	export class addegress extends Struct {
		@Struct.field(Name, { array: true })
		declare accounts: Name[];
	}
	@Struct.type('close')
	export class close extends Struct {
		@Struct.field(Name)
		declare owner: Name;
		@Struct.field(Asset.Symbol)
		declare symbol: Asset.Symbol;
	}
	@Struct.type('create')
	export class create extends Struct {
		@Struct.field(Name)
		declare issuer: Name;
		@Struct.field(Asset)
		declare maximum_supply: Asset;
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
	@Struct.type('egresslist_row')
	export class egresslist_row extends Struct {
		@Struct.field(Name)
		declare account: Name;
	}
	@Struct.type('issue')
	export class issue extends Struct {
		@Struct.field(Name)
		declare to: Name;
		@Struct.field(Asset)
		declare quantity: Asset;
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
	@Struct.type('removeegress')
	export class removeegress extends Struct {
		@Struct.field(Name, { array: true })
		declare accounts: Name[];
	}
	@Struct.type('retire')
	export class retire extends Struct {
		@Struct.field(Asset)
		declare quantity: Asset;
		@Struct.field('string')
		declare memo: string;
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
	@Struct.type('unwrap')
	export class unwrap extends Struct {
		@Struct.field(Name)
		declare owner: Name;
		@Struct.field(Int64)
		declare bytes: Int64;
	}
}
export const TableMap = {
	accounts: Types.account,
	egresslist: Types.egresslist_row,
	stat: Types.currency_stats
};
export interface TableTypes {
	accounts: Types.account;
	egresslist: Types.egresslist_row;
	stat: Types.currency_stats;
}
export type RowType<T> = T extends keyof TableTypes ? TableTypes[T] : any;
export type TableNames = keyof TableTypes;
export namespace ActionParams {
	export namespace Type {}
	export interface addegress {
		accounts: NameType[];
	}
	export interface close {
		owner: NameType;
		symbol: Asset.SymbolType;
	}
	export interface create {
		issuer: NameType;
		maximum_supply: AssetType;
	}
	export interface issue {
		to: NameType;
		quantity: AssetType;
		memo: string;
	}
	export interface open {
		owner: NameType;
		symbol: Asset.SymbolType;
		ram_payer: NameType;
	}
	export interface removeegress {
		accounts: NameType[];
	}
	export interface retire {
		quantity: AssetType;
		memo: string;
	}
	export interface transfer {
		from: NameType;
		to: NameType;
		quantity: AssetType;
		memo: string;
	}
	export interface unwrap {
		owner: NameType;
		bytes: Int64Type;
	}
}
export interface ActionNameParams {
	addegress: ActionParams.addegress;
	close: ActionParams.close;
	create: ActionParams.create;
	issue: ActionParams.issue;
	open: ActionParams.open;
	removeegress: ActionParams.removeegress;
	retire: ActionParams.retire;
	transfer: ActionParams.transfer;
	unwrap: ActionParams.unwrap;
}
export type ActionNames = keyof ActionNameParams;
export class Contract extends BaseContract {
	constructor(args: PartialBy<ContractArgs, 'abi' | 'account'>) {
		super({
			client: args.client,
			abi: abi,
			account: args.account || Name.from('eosio.wram')
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
