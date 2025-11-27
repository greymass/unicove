import type { Action, NameType, UInt32Type, UInt8Type } from '@wharfkit/antelope';
import { ABI, Blob, Int64, Name, Struct, UInt32, UInt8 } from '@wharfkit/antelope';
import type { ActionOptions, ContractArgs, PartialBy, Table } from '@wharfkit/contract';
import { Contract as BaseContract } from '@wharfkit/contract';
export const abiBlob = Blob.from(
	'DmVvc2lvOjphYmkvMS4yABcLYnVsa3Jtdm90ZXMAAgh0b3BpY19pZARuYW1lCW51bV92b3RlcwZ1aW50MzIKY2hhbmdldm90ZQADBXZvdGVyBG5hbWUIdG9waWNfaWQEbmFtZQl2b3RlX3R5cGUFdWludDgKY29uZmlnX3JvdwACB2VuYWJsZWQEYm9vbA9zeXN0ZW1fY29udHJhY3QEbmFtZQtjcmVhdGV0b3BpYwACAmlkBG5hbWULZGVzY3JpcHRpb24Gc3RyaW5nC2RlbGV0ZXRvcGljAAECaWQEbmFtZQdkaXNhYmxlAAAGZW5hYmxlAAASZ2V0X3RvcGljX3Jlc3BvbnNlAAICaWQEbmFtZQtkZXNjcmlwdGlvbgZzdHJpbmcRZ2V0X3ZvdGVfcmVzcG9uc2UAAwV2b3RlcgRuYW1lCHRvcGljX2lkBG5hbWUJdm90ZV90eXBlBXVpbnQ4GWdldF92b3Rlcl93ZWlnaHRfcmVzcG9uc2UAAgV2b3RlcgRuYW1lBndlaWdodAVpbnQ2NAhnZXR0b3BpYwABAmlkBG5hbWUJZ2V0dG9waWNzAAAHZ2V0dm90ZQACBXZvdGVyBG5hbWUIdG9waWNfaWQEbmFtZQlnZXR2b3RlcnMAAQh0b3BpY19pZARuYW1lCWdldHdlaWdodAABBXZvdGVyBG5hbWUKZ2V0d2VpZ2h0cwABBnZvdGVycwZuYW1lW10KcmVtb3Zldm90ZQACBXZvdGVyBG5hbWUIdG9waWNfaWQEbmFtZQVyZXNldAAACXNldGNvbmZpZwABBmNvbmZpZwpjb25maWdfcm93CXRvcGljX3JvdwACAmlkBG5hbWULZGVzY3JpcHRpb24Gc3RyaW5nC3VwZGF0ZXRvcGljAAICaWQEbmFtZQtkZXNjcmlwdGlvbgZzdHJpbmcEdm90ZQADBXZvdGVyBG5hbWUIdG9waWNfaWQEbmFtZQl2b3RlX3R5cGUFdWludDgIdm90ZV9yb3cAAwV2b3RlcgRuYW1lCHRvcGljX2lkBG5hbWUJdm90ZV90eXBlBXVpbnQ4EQCwynTLC6M+C2J1bGtybXZvdGVzsAItLS0KCnNwZWNfdmVyc2lvbjogIjAuMi4wIgp0aXRsZTogJ0J1bGsgUmVtb3ZlIFZvdGVzJwpzdW1tYXJ5OiAnTWFpbnRhaW5lciBhY3Rpb24gdG8gcmVtb3ZlIG11bHRpcGxlIHZvdGVzIGZyb20gYSB0b3BpYyBmb3IgYWRtaW5pc3RyYXRpdmUgcHVycG9zZXMuIFJlbW92ZXMgdXAgdG8gdGhlIHNwZWNpZmllZCBudW1iZXIgb2Ygdm90ZXMuJwppY29uOiBodHRwczovL2F2YXRhcnMuZ2l0aHVidXNlcmNvbnRlbnQuY29tL3UvMTQ3MjkyODYxP3M9NDAwJnU9M2IxYWY2NmU5MGRkODUxZjRkN2MwOTZlZDZhMmZiYjRiOWUxOTBkYQoKLS0tAIDKdCs2TUMKY2hhbmdldm90ZYkCLS0tCgpzcGVjX3ZlcnNpb246ICIwLjIuMCIKdGl0bGU6ICdDaGFuZ2UgVm90ZScKc3VtbWFyeTogJ0FsbG93cyBhIHVzZXIgdG8gY2hhbmdlIHRoZWlyIGV4aXN0aW5nIHZvdGUgb24gYSB0b3BpYyBmcm9tIHN1cHBvcnQgdG8gb3Bwb3NpdGlvbiBvciB2aWNlIHZlcnNhLicKaWNvbjogaHR0cHM6Ly9hdmF0YXJzLmdpdGh1YnVzZXJjb250ZW50LmNvbS91LzE0NzI5Mjg2MT9zPTQwMCZ1PTNiMWFmNjZlOTBkZDg1MWY0ZDdjMDk2ZWQ2YTJmYmI0YjllMTkwZGEKCi0tLQCQqzSrbNRFC2NyZWF0ZXRvcGlj5AEtLS0KCnNwZWNfdmVyc2lvbjogIjAuMi4wIgp0aXRsZTogJ0NyZWF0ZSBUb3BpYycKc3VtbWFyeTogJ0NyZWF0ZXMgYSBuZXcgdG9waWMgd2l0aCB0aGUgc3BlY2lmaWVkIElEIGFuZCBkZXNjcmlwdGlvbi4nCmljb246IGh0dHBzOi8vYXZhdGFycy5naXRodWJ1c2VyY29udGVudC5jb20vdS8xNDcyOTI4NjE/cz00MDAmdT0zYjFhZjY2ZTkwZGQ4NTFmNGQ3YzA5NmVkNmEyZmJiNGI5ZTE5MGRhCgotLS0AkKs0q6yiSgtkZWxldGV0b3BpY9YBLS0tCgpzcGVjX3ZlcnNpb246ICIwLjIuMCIKdGl0bGU6ICdEZWxldGUgVG9waWMnCnN1bW1hcnk6ICdEZWxldGVzIGFuIGV4aXN0aW5nIHRvcGljIGZyb20gdGhlIHJlZ2lzdHJ5LicKaWNvbjogaHR0cHM6Ly9hdmF0YXJzLmdpdGh1YnVzZXJjb250ZW50LmNvbS91LzE0NzI5Mjg2MT9zPTQwMCZ1PTNiMWFmNjZlOTBkZDg1MWY0ZDdjMDk2ZWQ2YTJmYmI0YjllMTkwZGEKCi0tLQAAAEDFY7BLB2Rpc2FibGWFAi0tLQoKc3BlY192ZXJzaW9uOiAiMC4yLjAiCnRpdGxlOiAnRGlzYWJsZSBDb250cmFjdCcKc3VtbWFyeTogJ01haW50YWluZXIgYWN0aW9uIHRvIGRpc2FibGUgdGhlIGNvbnRyYWN0LCBwcmV2ZW50aW5nIHVzZXIgYWN0aW9ucyBmcm9tIGJlaW5nIGV4ZWN1dGVkLicKaWNvbjogaHR0cHM6Ly9hdmF0YXJzLmdpdGh1YnVzZXJjb250ZW50LmNvbS91LzE0NzI5Mjg2MT9zPTQwMCZ1PTNiMWFmNjZlOTBkZDg1MWY0ZDdjMDk2ZWQ2YTJmYmI0YjllMTkwZGEKCi0tLQAAAACoeMxUBmVuYWJsZfwBLS0tCgpzcGVjX3ZlcnNpb246ICIwLjIuMCIKdGl0bGU6ICdFbmFibGUgQ29udHJhY3QnCnN1bW1hcnk6ICdNYWludGFpbmVyIGFjdGlvbiB0byBlbmFibGUgdGhlIGNvbnRyYWN0LCBhbGxvd2luZyB1c2VyIGFjdGlvbnMgdG8gYmUgZXhlY3V0ZWQuJwppY29uOiBodHRwczovL2F2YXRhcnMuZ2l0aHVidXNlcmNvbnRlbnQuY29tL3UvMTQ3MjkyODYxP3M9NDAwJnU9M2IxYWY2NmU5MGRkODUxZjRkN2MwOTZlZDZhMmZiYjRiOWUxOTBkYQoKLS0tAAAAyFWas2IIZ2V0dG9waWPWAS0tLQoKc3BlY192ZXJzaW9uOiAiMC4yLjAiCnRpdGxlOiAnR2V0IFRvcGljJwpzdW1tYXJ5OiAnUmVhZC1vbmx5IGFjdGlvbiB0byByZXRyaWV2ZSBhIHRvcGljIGJ5IGl0cyBJRC4nCmljb246IGh0dHBzOi8vYXZhdGFycy5naXRodWJ1c2VyY29udGVudC5jb20vdS8xNDcyOTI4NjE/cz00MDAmdT0zYjFhZjY2ZTkwZGQ4NTFmNGQ3YzA5NmVkNmEyZmJiNGI5ZTE5MGRhCgotLS0AAMDIVZqzYglnZXR0b3BpY3PmAS0tLQoKc3BlY192ZXJzaW9uOiAiMC4yLjAiCnRpdGxlOiAnR2V0IEFsbCBUb3BpY3MnCnN1bW1hcnk6ICdSZWFkLW9ubHkgYWN0aW9uIHRvIHJldHJpZXZlIGFsbCB0b3BpY3MgZnJvbSB0aGUgcmVnaXN0cnkuJwppY29uOiBodHRwczovL2F2YXRhcnMuZ2l0aHVidXNlcmNvbnRlbnQuY29tL3UvMTQ3MjkyODYxP3M9NDAwJnU9M2IxYWY2NmU5MGRkODUxZjRkN2MwOTZlZDZhMmZiYjRiOWUxOTBkYQoKLS0tAAAAQGW6s2IHZ2V0dm90ZeYBLS0tCgpzcGVjX3ZlcnNpb246ICIwLjIuMCIKdGl0bGU6ICdHZXQgVm90ZScKc3VtbWFyeTogJ1JlYWQtb25seSBhY3Rpb24gdG8gcmV0cmlldmUgYSBzcGVjaWZpYyB1c2VyXCdzIHZvdGUgb24gYSB0b3BpYy4nCmljb246IGh0dHBzOi8vYXZhdGFycy5naXRodWJ1c2VyY29udGVudC5jb20vdS8xNDcyOTI4NjE/cz00MDAmdT0zYjFhZjY2ZTkwZGQ4NTFmNGQ3YzA5NmVkNmEyZmJiNGI5ZTE5MGRhCgotLS0AAMBXZbqzYglnZXR2b3RlcnP5AS0tLQoKc3BlY192ZXJzaW9uOiAiMC4yLjAiCnRpdGxlOiAnR2V0IEFsbCBWb3RlcnMnCnN1bW1hcnk6ICdSZWFkLW9ubHkgYWN0aW9uIHRvIHJldHJpZXZlIGFsbCB2b3RlcnMgYW5kIHRoZWlyIHZvdGVzIGZvciBhIHNwZWNpZmljIHRvcGljLicKaWNvbjogaHR0cHM6Ly9hdmF0YXJzLmdpdGh1YnVzZXJjb250ZW50LmNvbS91LzE0NzI5Mjg2MT9zPTQwMCZ1PTNiMWFmNjZlOTBkZDg1MWY0ZDdjMDk2ZWQ2YTJmYmI0YjllMTkwZGEKCi0tLQAAyI05xbNiCWdldHdlaWdodJwCLS0tCgpzcGVjX3ZlcnNpb246ICIwLjIuMCIKdGl0bGU6ICdHZXQgVm90ZXIgV2VpZ2h0JwpzdW1tYXJ5OiAnUmVhZC1vbmx5IGFjdGlvbiB0byByZXRyaWV2ZSB0aGUgdm90aW5nIHdlaWdodCBvZiBhIHZvdGVyIGJhc2VkIG9uIHRoZWlyIHN0YWtlZCB0b2tlbnMgaW4gdGhlIHN5c3RlbSBjb250cmFjdC4nCmljb246IGh0dHBzOi8vYXZhdGFycy5naXRodWJ1c2VyY29udGVudC5jb20vdS8xNDcyOTI4NjE/cz00MDAmdT0zYjFhZjY2ZTkwZGQ4NTFmNGQ3YzA5NmVkNmEyZmJiNGI5ZTE5MGRhCgotLS0AAM6NOcWzYgpnZXR3ZWlnaHRzrwItLS0KCnNwZWNfdmVyc2lvbjogIjAuMi4wIgp0aXRsZTogJ0dldCBNdWx0aXBsZSBWb3RlciBXZWlnaHRzJwpzdW1tYXJ5OiAnUmVhZC1vbmx5IGFjdGlvbiB0byByZXRyaWV2ZSB0aGUgdm90aW5nIHdlaWdodHMgb2YgbXVsdGlwbGUgdm90ZXJzIGJhc2VkIG9uIHRoZWlyIHN0YWtlZCB0b2tlbnMgaW4gdGhlIHN5c3RlbSBjb250cmFjdC4nCmljb246IGh0dHBzOi8vYXZhdGFycy5naXRodWJ1c2VyY29udGVudC5jb20vdS8xNDcyOTI4NjE/cz00MDAmdT0zYjFhZjY2ZTkwZGQ4NTFmNGQ3YzA5NmVkNmEyZmJiNGI5ZTE5MGRhCgotLS0AgMp0q02lugpyZW1vdmV2b3Rl2QEtLS0KCnNwZWNfdmVyc2lvbjogIjAuMi4wIgp0aXRsZTogJ1JlbW92ZSBWb3RlJwpzdW1tYXJ5OiAnQWxsb3dzIGEgdXNlciB0byByZW1vdmUgdGhlaXIgdm90ZSBmcm9tIGEgdG9waWMuJwppY29uOiBodHRwczovL2F2YXRhcnMuZ2l0aHVidXNlcmNvbnRlbnQuY29tL3UvMTQ3MjkyODYxP3M9NDAwJnU9M2IxYWY2NmU5MGRkODUxZjRkN2MwOTZlZDZhMmZiYjRiOWUxOTBkYQoKLS0tAAAAAICssLoFcmVzZXQAAABgbk2KssIJc2V0Y29uZmlnlQItLS0KCnNwZWNfdmVyc2lvbjogIjAuMi4wIgp0aXRsZTogJ1NldCBDb250cmFjdCBDb25maWd1cmF0aW9uJwpzdW1tYXJ5OiAnTWFpbnRhaW5lciBhY3Rpb24gdG8gc2V0IHRoZSB2YWx1ZXMgb2YgdGhlIGNvbmZpZyB0YWJsZSB0byB1cGRhdGUgaG93IHRoaXMgY29udHJhY3Qgb3BlcmF0ZXMuJwppY29uOiBodHRwczovL2F2YXRhcnMuZ2l0aHVidXNlcmNvbnRlbnQuY29tL3UvMTQ3MjkyODYxP3M9NDAwJnU9M2IxYWY2NmU5MGRkODUxZjRkN2MwOTZlZDZhMmZiYjRiOWUxOTBkYQoKLS0tAJCrNKtsUtULdXBkYXRldG9waWPXAS0tLQoKc3BlY192ZXJzaW9uOiAiMC4yLjAiCnRpdGxlOiAnVXBkYXRlIFRvcGljJwpzdW1tYXJ5OiAnVXBkYXRlcyB0aGUgZGVzY3JpcHRpb24gb2YgYW4gZXhpc3RpbmcgdG9waWMuJwppY29uOiBodHRwczovL2F2YXRhcnMuZ2l0aHVidXNlcmNvbnRlbnQuY29tL3UvMTQ3MjkyODYxP3M9NDAwJnU9M2IxYWY2NmU5MGRkODUxZjRkN2MwOTZlZDZhMmZiYjRiOWUxOTBkYQoKLS0tAAAAAACgMt0Edm90ZfcBLS0tCgpzcGVjX3ZlcnNpb246ICIwLjIuMCIKdGl0bGU6ICdWb3RlIG9uIFRvcGljJwpzdW1tYXJ5OiAnQWxsb3dzIGEgdXNlciB0byBleHByZXNzIHRoZWlyIHNlbnRpbWVudCAoc3VwcG9ydCBvciBvcHBvc2l0aW9uKSBvbiBhIHRvcGljLicKaWNvbjogaHR0cHM6Ly9hdmF0YXJzLmdpdGh1YnVzZXJjb250ZW50LmNvbS91LzE0NzI5Mjg2MT9zPTQwMCZ1PTNiMWFmNjZlOTBkZDg1MWY0ZDdjMDk2ZWQ2YTJmYmI0YjllMTkwZGEKCi0tLQMAAAAAMLcmRQNpNjQAAApjb25maWdfcm93AAAAAGDkKs0DaTY0AAAJdG9waWNfcm93AAAAAACsMt0DaTY0AAAIdm90ZV9yb3cBCXNlbnRpbWVudAlzZW50aW1lbnQAAAAGAAAAyFWas2ISZ2V0X3RvcGljX3Jlc3BvbnNlAADAyFWas2IUZ2V0X3RvcGljX3Jlc3BvbnNlW10AAABAZbqzYhFnZXRfdm90ZV9yZXNwb25zZQAAwFdlurNiE2dldF92b3RlX3Jlc3BvbnNlW10AAMiNOcWzYhlnZXRfdm90ZXJfd2VpZ2h0X3Jlc3BvbnNlAADOjTnFs2IbZ2V0X3ZvdGVyX3dlaWdodF9yZXNwb25zZVtd'
);
export const abi = ABI.from(abiBlob);
export namespace Types {
	@Struct.type('bulkrmvotes')
	export class bulkrmvotes extends Struct {
		@Struct.field(Name)
		declare topic_id: Name;
		@Struct.field(UInt32)
		declare num_votes: UInt32;
	}
	@Struct.type('changevote')
	export class changevote extends Struct {
		@Struct.field(Name)
		declare voter: Name;
		@Struct.field(Name)
		declare topic_id: Name;
		@Struct.field(UInt8)
		declare vote_type: UInt8;
	}
	@Struct.type('config_row')
	export class config_row extends Struct {
		@Struct.field('bool')
		declare enabled: boolean;
		@Struct.field(Name)
		declare system_contract: Name;
	}
	@Struct.type('createtopic')
	export class createtopic extends Struct {
		@Struct.field(Name)
		declare id: Name;
		@Struct.field('string')
		declare description: string;
	}
	@Struct.type('deletetopic')
	export class deletetopic extends Struct {
		@Struct.field(Name)
		declare id: Name;
	}
	@Struct.type('disable')
	export class disable extends Struct {}
	@Struct.type('enable')
	export class enable extends Struct {}
	@Struct.type('get_topic_response')
	export class get_topic_response extends Struct {
		@Struct.field(Name)
		declare id: Name;
		@Struct.field('string')
		declare description: string;
	}
	@Struct.type('get_vote_response')
	export class get_vote_response extends Struct {
		@Struct.field(Name)
		declare voter: Name;
		@Struct.field(Name)
		declare topic_id: Name;
		@Struct.field(UInt8)
		declare vote_type: UInt8;
	}
	@Struct.type('get_voter_weight_response')
	export class get_voter_weight_response extends Struct {
		@Struct.field(Name)
		declare voter: Name;
		@Struct.field(Int64)
		declare weight: Int64;
	}
	@Struct.type('gettopic')
	export class gettopic extends Struct {
		@Struct.field(Name)
		declare id: Name;
	}
	@Struct.type('gettopics')
	export class gettopics extends Struct {}
	@Struct.type('getvote')
	export class getvote extends Struct {
		@Struct.field(Name)
		declare voter: Name;
		@Struct.field(Name)
		declare topic_id: Name;
	}
	@Struct.type('getvoters')
	export class getvoters extends Struct {
		@Struct.field(Name)
		declare topic_id: Name;
	}
	@Struct.type('getweight')
	export class getweight extends Struct {
		@Struct.field(Name)
		declare voter: Name;
	}
	@Struct.type('getweights')
	export class getweights extends Struct {
		@Struct.field(Name, { array: true })
		declare voters: Name[];
	}
	@Struct.type('removevote')
	export class removevote extends Struct {
		@Struct.field(Name)
		declare voter: Name;
		@Struct.field(Name)
		declare topic_id: Name;
	}
	@Struct.type('reset')
	export class reset extends Struct {}
	@Struct.type('setconfig')
	export class setconfig extends Struct {
		@Struct.field(config_row)
		declare config: config_row;
	}
	@Struct.type('topic_row')
	export class topic_row extends Struct {
		@Struct.field(Name)
		declare id: Name;
		@Struct.field('string')
		declare description: string;
	}
	@Struct.type('updatetopic')
	export class updatetopic extends Struct {
		@Struct.field(Name)
		declare id: Name;
		@Struct.field('string')
		declare description: string;
	}
	@Struct.type('vote')
	export class vote extends Struct {
		@Struct.field(Name)
		declare voter: Name;
		@Struct.field(Name)
		declare topic_id: Name;
		@Struct.field(UInt8)
		declare vote_type: UInt8;
	}
	@Struct.type('vote_row')
	export class vote_row extends Struct {
		@Struct.field(Name)
		declare voter: Name;
		@Struct.field(Name)
		declare topic_id: Name;
		@Struct.field(UInt8)
		declare vote_type: UInt8;
	}
}
export const TableMap = {
	config: Types.config_row,
	topics: Types.topic_row,
	votes: Types.vote_row
};
export interface TableTypes {
	config: Types.config_row;
	topics: Types.topic_row;
	votes: Types.vote_row;
}
export type RowType<T> = T extends keyof TableTypes ? TableTypes[T] : any;
export type TableNames = keyof TableTypes;
export namespace ActionParams {
	export namespace Type {
		export interface config_row {
			enabled: boolean;
			system_contract: NameType;
		}
	}
	export interface bulkrmvotes {
		topic_id: NameType;
		num_votes: UInt32Type;
	}
	export interface changevote {
		voter: NameType;
		topic_id: NameType;
		vote_type: UInt8Type;
	}
	export interface createtopic {
		id: NameType;
		description: string;
	}
	export interface deletetopic {
		id: NameType;
	}
	export interface disable {}
	export interface enable {}
	export interface gettopic {
		id: NameType;
	}
	export interface gettopics {}
	export interface getvote {
		voter: NameType;
		topic_id: NameType;
	}
	export interface getvoters {
		topic_id: NameType;
	}
	export interface getweight {
		voter: NameType;
	}
	export interface getweights {
		voters: NameType[];
	}
	export interface removevote {
		voter: NameType;
		topic_id: NameType;
	}
	export interface reset {}
	export interface setconfig {
		config: Type.config_row;
	}
	export interface updatetopic {
		id: NameType;
		description: string;
	}
	export interface vote {
		voter: NameType;
		topic_id: NameType;
		vote_type: UInt8Type;
	}
}
export interface ActionNameParams {
	bulkrmvotes: ActionParams.bulkrmvotes;
	changevote: ActionParams.changevote;
	createtopic: ActionParams.createtopic;
	deletetopic: ActionParams.deletetopic;
	disable: ActionParams.disable;
	enable: ActionParams.enable;
	gettopic: ActionParams.gettopic;
	gettopics: ActionParams.gettopics;
	getvote: ActionParams.getvote;
	getvoters: ActionParams.getvoters;
	getweight: ActionParams.getweight;
	getweights: ActionParams.getweights;
	removevote: ActionParams.removevote;
	reset: ActionParams.reset;
	setconfig: ActionParams.setconfig;
	updatetopic: ActionParams.updatetopic;
	vote: ActionParams.vote;
}
export type ActionNames = keyof ActionNameParams;
export interface ActionReturnValues {
	gettopic: Types.get_topic_response;
	gettopics: Types.get_topic_response[];
	getvote: Types.get_vote_response;
	getvoters: Types.get_vote_response[];
	getweight: Types.get_voter_weight_response;
	getweights: Types.get_voter_weight_response[];
}
export type ActionReturnNames = keyof ActionReturnValues;
export class Contract extends BaseContract {
	constructor(args: PartialBy<ContractArgs, 'abi' | 'account'>) {
		super({
			client: args.client,
			abi: abi,
			account: args.account || Name.from('sentiment.gm')
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
	table<T extends TableNames>(name: T, scope?: NameType): Table<RowType<T>> {
		return super.table(name, scope, TableMap[name]);
	}
}
