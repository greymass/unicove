import type { Action, NameType } from '@wharfkit/antelope';
import {
	ABI,
	Asset,
	Blob,
	BlockTimestamp,
	Bytes,
	Float64,
	Int64,
	Name,
	Struct,
	TimePoint,
	TimePointSec,
	UInt16,
	UInt32,
	UInt64,
	UInt8
} from '@wharfkit/antelope';
import type { ActionOptions, ContractArgs, PartialBy, Table } from '@wharfkit/contract';
import { Contract as BaseContract } from '@wharfkit/contract';
export const abiBlob = Blob.from(
	'DmVvc2lvOjphYmkvMS4yABkHYWNjb3VudAABB2FjY291bnQEbmFtZQhiYWxhbmNlcwADB2FjY291bnQEbmFtZQZ0b2tlbnMSdG9rZW5fZGVmaW5pdGlvbltdDHplcm9iYWxhbmNlcwRib29sFWJsb2NrY2hhaW5fcGFyYW1ldGVycwARE21heF9ibG9ja19uZXRfdXNhZ2UGdWludDY0GnRhcmdldF9ibG9ja19uZXRfdXNhZ2VfcGN0BnVpbnQzMhltYXhfdHJhbnNhY3Rpb25fbmV0X3VzYWdlBnVpbnQzMh5iYXNlX3Blcl90cmFuc2FjdGlvbl9uZXRfdXNhZ2UGdWludDMyEG5ldF91c2FnZV9sZWV3YXkGdWludDMyI2NvbnRleHRfZnJlZV9kaXNjb3VudF9uZXRfdXNhZ2VfbnVtBnVpbnQzMiNjb250ZXh0X2ZyZWVfZGlzY291bnRfbmV0X3VzYWdlX2RlbgZ1aW50MzITbWF4X2Jsb2NrX2NwdV91c2FnZQZ1aW50MzIadGFyZ2V0X2Jsb2NrX2NwdV91c2FnZV9wY3QGdWludDMyGW1heF90cmFuc2FjdGlvbl9jcHVfdXNhZ2UGdWludDMyGW1pbl90cmFuc2FjdGlvbl9jcHVfdXNhZ2UGdWludDMyGG1heF90cmFuc2FjdGlvbl9saWZldGltZQZ1aW50MzIeZGVmZXJyZWRfdHJ4X2V4cGlyYXRpb25fd2luZG93BnVpbnQzMhVtYXhfdHJhbnNhY3Rpb25fZGVsYXkGdWludDMyFm1heF9pbmxpbmVfYWN0aW9uX3NpemUGdWludDMyF21heF9pbmxpbmVfYWN0aW9uX2RlcHRoBnVpbnQxNhNtYXhfYXV0aG9yaXR5X2RlcHRoBnVpbnQxNgpjb25maWdfcm93AAcPc3lzdGVtX2NvbnRyYWN0BG5hbWUUc3lzdGVtX2NvbnRyYWN0X21zaWcEbmFtZRVzeXN0ZW1fdG9rZW5fY29udHJhY3QEbmFtZRNzeXN0ZW1fdG9rZW5fc3ltYm9sBnN5bWJvbBVzeXN0ZW1fcmFtY29yZV9zeW1ib2wGc3ltYm9sEXN5c3RlbV9yYW1fc3ltYm9sBnN5bWJvbBFzeXN0ZW1fcmV4X3N5bWJvbAZzeW1ib2wJY29ubmVjdG9yAAIHYmFsYW5jZQVhc3NldAZ3ZWlnaHQHZmxvYXQ2NBNkZWxlZ2F0ZWRfYmFuZHdpZHRoAAQEZnJvbQRuYW1lAnRvBG5hbWUKbmV0X3dlaWdodAVhc3NldApjcHVfd2VpZ2h0BWFzc2V0EmVvc2lvX2dsb2JhbF9zdGF0ZRVibG9ja2NoYWluX3BhcmFtZXRlcnMNDG1heF9yYW1fc2l6ZQZ1aW50NjQYdG90YWxfcmFtX2J5dGVzX3Jlc2VydmVkBnVpbnQ2NA90b3RhbF9yYW1fc3Rha2UFaW50NjQdbGFzdF9wcm9kdWNlcl9zY2hlZHVsZV91cGRhdGUUYmxvY2tfdGltZXN0YW1wX3R5cGUYbGFzdF9wZXJ2b3RlX2J1Y2tldF9maWxsCnRpbWVfcG9pbnQOcGVydm90ZV9idWNrZXQFaW50NjQPcGVyYmxvY2tfYnVja2V0BWludDY0E3RvdGFsX3VucGFpZF9ibG9ja3MGdWludDMyFXRvdGFsX2FjdGl2YXRlZF9zdGFrZQVpbnQ2NBt0aHJlc2hfYWN0aXZhdGVkX3N0YWtlX3RpbWUKdGltZV9wb2ludBtsYXN0X3Byb2R1Y2VyX3NjaGVkdWxlX3NpemUGdWludDE2GnRvdGFsX3Byb2R1Y2VyX3ZvdGVfd2VpZ2h0B2Zsb2F0NjQPbGFzdF9uYW1lX2Nsb3NlFGJsb2NrX3RpbWVzdGFtcF90eXBlDmV4Y2hhbmdlX3N0YXRlAAMGc3VwcGx5BWFzc2V0BGJhc2UJY29ubmVjdG9yBXF1b3RlCWNvbm5lY3RvchRnZXRfYWNjb3VudF9yZXNwb25zZQAHB2FjY291bnQEbmFtZQdiYWxhbmNlBWFzc2V0C2RlbGVnYXRpb25zFWRlbGVnYXRlZF9iYW5kd2lkdGhbXQlwcm9wb3NhbHMKcHJvcG9zYWxbXQZyZWZ1bmQOcmVmdW5kX3JlcXVlc3QGcmV4YmFsC3JleF9iYWxhbmNlB3JleGZ1bmQIcmV4X2Z1bmQUZ2V0X25ldHdvcmtfcmVzcG9uc2UABQZnbG9iYWwSZW9zaW9fZ2xvYmFsX3N0YXRlB3Bvd2VydXANcG93ZXJ1cF9zdGF0ZQNyYW0OZXhjaGFuZ2Vfc3RhdGUDcmV4CHJleF9wb29sBXRva2VuDHRva2VuX3N1cHBseQduZXR3b3JrAAAZcGFpcl90aW1lX3BvaW50X3NlY19pbnQ2NAACBWZpcnN0DnRpbWVfcG9pbnRfc2VjBnNlY29uZAVpbnQ2NA1wb3dlcnVwX3N0YXRlAAUHdmVyc2lvbgV1aW50OANuZXQWcG93ZXJ1cF9zdGF0ZV9yZXNvdXJjZQNjcHUWcG93ZXJ1cF9zdGF0ZV9yZXNvdXJjZQxwb3dlcnVwX2RheXMGdWludDMyD21pbl9wb3dlcnVwX2ZlZQVhc3NldBZwb3dlcnVwX3N0YXRlX3Jlc291cmNlAA8HdmVyc2lvbgV1aW50OAZ3ZWlnaHQFaW50NjQMd2VpZ2h0X3JhdGlvBWludDY0FGFzc3VtZWRfc3Rha2Vfd2VpZ2h0BWludDY0FGluaXRpYWxfd2VpZ2h0X3JhdGlvBWludDY0E3RhcmdldF93ZWlnaHRfcmF0aW8FaW50NjQRaW5pdGlhbF90aW1lc3RhbXAOdGltZV9wb2ludF9zZWMQdGFyZ2V0X3RpbWVzdGFtcA50aW1lX3BvaW50X3NlYwhleHBvbmVudAdmbG9hdDY0CmRlY2F5X3NlY3MGdWludDMyCW1pbl9wcmljZQVhc3NldAltYXhfcHJpY2UFYXNzZXQLdXRpbGl6YXRpb24FaW50NjQUYWRqdXN0ZWRfdXRpbGl6YXRpb24FaW50NjQVdXRpbGl6YXRpb25fdGltZXN0YW1wDnRpbWVfcG9pbnRfc2VjCHByb3Bvc2FsAAMNcHJvcG9zYWxfbmFtZQRuYW1lEnBhY2tlZF90cmFuc2FjdGlvbgVieXRlcxJlYXJsaWVzdF9leGVjX3RpbWUMdGltZV9wb2ludD8kDnJlZnVuZF9yZXF1ZXN0AAQFb3duZXIEbmFtZQxyZXF1ZXN0X3RpbWUOdGltZV9wb2ludF9zZWMKbmV0X2Ftb3VudAVhc3NldApjcHVfYW1vdW50BWFzc2V0BXJlc2V0AAALcmV4X2JhbGFuY2UABgd2ZXJzaW9uBXVpbnQ4BW93bmVyBG5hbWUKdm90ZV9zdGFrZQVhc3NldAtyZXhfYmFsYW5jZQVhc3NldAttYXR1cmVkX3JleAVpbnQ2NA5yZXhfbWF0dXJpdGllcxtwYWlyX3RpbWVfcG9pbnRfc2VjX2ludDY0W10IcmV4X2Z1bmQAAwd2ZXJzaW9uBXVpbnQ4BW93bmVyBG5hbWUHYmFsYW5jZQVhc3NldAhyZXhfcG9vbAAIB3ZlcnNpb24FdWludDgKdG90YWxfbGVudAVhc3NldAx0b3RhbF91bmxlbnQFYXNzZXQKdG90YWxfcmVudAVhc3NldA50b3RhbF9sZW5kYWJsZQVhc3NldAl0b3RhbF9yZXgFYXNzZXQQbmFtZWJpZF9wcm9jZWVkcwVhc3NldAhsb2FuX251bQZ1aW50NjQJc2V0Y29uZmlnAAQPc3lzdGVtX2NvbnRyYWN0BG5hbWUUc3lzdGVtX2NvbnRyYWN0X21zaWcEbmFtZRVzeXN0ZW1fdG9rZW5fY29udHJhY3QEbmFtZRNzeXN0ZW1fdG9rZW5fc3ltYm9sBnN5bWJvbAZzdXBwbHkAAQNkZWYQdG9rZW5fZGVmaW5pdGlvbhB0b2tlbl9kZWZpbml0aW9uAAIIY29udHJhY3QEbmFtZQZzeW1ib2wGc3ltYm9sDHRva2VuX3N1cHBseQAEA2RlZhB0b2tlbl9kZWZpbml0aW9uBmxvY2tlZAVhc3NldANtYXgFYXNzZXQGc3VwcGx5BWFzc2V0BHdpcGUAAAcAAAAgT00RMgdhY2NvdW50vwEtLS0KCnNwZWNfdmVyc2lvbjogIjAuMi4wIgp0aXRsZTogYWNjb3VudApzdW1tYXJ5OiAnUmV0cmlldmUgYWNjb3VudCBpbmZvcm1hdGlvbicKaWNvbjogaHR0cHM6Ly9hdmF0YXJzLmdpdGh1YnVzZXJjb250ZW50LmNvbS91LzE0NzI5Mjg2MT9zPTQwMCZ1PTNiMWFmNjZlOTBkZDg1MWY0ZDdjMDk2ZWQ2YTJmYmI0YjllMTkwZGEKCi0tLQAAAFihaaI5CGJhbGFuY2VzxgEtLS0KCnNwZWNfdmVyc2lvbjogIjAuMi4wIgp0aXRsZTogYmFsYW5jZXMKc3VtbWFyeTogJ1JldHJpZXZlIHRva2VuIGJhbGFuY2UgaW5mb3JtYXRpb24nCmljb246IGh0dHBzOi8vYXZhdGFycy5naXRodWJ1c2VyY29udGVudC5jb20vdS8xNDcyOTI4NjE/cz00MDAmdT0zYjFhZjY2ZTkwZGQ4NTFmNGQ3YzA5NmVkNmEyZmJiNGI5ZTE5MGRhCgotLS0AAAAAXsqzmgduZXR3b3JrvwEtLS0KCnNwZWNfdmVyc2lvbjogIjAuMi4wIgp0aXRsZTogbmV0d29yawpzdW1tYXJ5OiAnUmV0cmlldmUgbmV0d29yayBpbmZvcm1hdGlvbicKaWNvbjogaHR0cHM6Ly9hdmF0YXJzLmdpdGh1YnVzZXJjb250ZW50LmNvbS91LzE0NzI5Mjg2MT9zPTQwMCZ1PTNiMWFmNjZlOTBkZDg1MWY0ZDdjMDk2ZWQ2YTJmYmI0YjllMTkwZGEKCi0tLQAAAACArLC6BXJlc2V0tAEtLS0KCnNwZWNfdmVyc2lvbjogIjAuMi4wIgp0aXRsZTogcmVzZXQKc3VtbWFyeTogJ0RFQlVHOiByZXNldCBhY3Rpb24nCmljb246IGh0dHBzOi8vYXZhdGFycy5naXRodWJ1c2VyY29udGVudC5jb20vdS8xNDcyOTI4NjE/cz00MDAmdT0zYjFhZjY2ZTkwZGQ4NTFmNGQ3YzA5NmVkNmEyZmJiNGI5ZTE5MGRhCgotLS0AAGBuTYqywglzZXRjb25maWe/AS0tLQoKc3BlY192ZXJzaW9uOiAiMC4yLjAiCnRpdGxlOiBzZXRjb25maWcKc3VtbWFyeTogJ1NldCBjb250cmFjdCBjb25maWd1cmF0aW9uJwppY29uOiBodHRwczovL2F2YXRhcnMuZ2l0aHVidXNlcmNvbnRlbnQuY29tL3UvMTQ3MjkyODYxP3M9NDAwJnU9M2IxYWY2NmU5MGRkODUxZjRkN2MwOTZlZDZhMmZiYjRiOWUxOTBkYQoKLS0tAAAAAPhYq8YGc3VwcGx5wwEtLS0KCnNwZWNfdmVyc2lvbjogIjAuMi4wIgp0aXRsZTogc3VwcGx5CnN1bW1hcnk6ICdSZXRyaWV2ZSB0b2tlbiBzdXBwbHkgaW5mb3JtYXRpb24nCmljb246IGh0dHBzOi8vYXZhdGFycy5naXRodWJ1c2VyY29udGVudC5jb20vdS8xNDcyOTI4NjE/cz00MDAmdT0zYjFhZjY2ZTkwZGQ4NTFmNGQ3YzA5NmVkNmEyZmJiNGI5ZTE5MGRhCgotLS0AAAAAAKCq4wR3aXBlsgEtLS0KCnNwZWNfdmVyc2lvbjogIjAuMi4wIgp0aXRsZTogd2lwZQpzdW1tYXJ5OiAnREVCVUc6IHdpcGUgYWN0aW9uJwppY29uOiBodHRwczovL2F2YXRhcnMuZ2l0aHVidXNlcmNvbnRlbnQuY29tL3UvMTQ3MjkyODYxP3M9NDAwJnU9M2IxYWY2NmU5MGRkODUxZjRkN2MwOTZlZDZhMmZiYjRiOWUxOTBkYQoKLS0tAQAAAAAwtyZFA2k2NAAACmNvbmZpZ19yb3cBA2FwaQNhcGkAAAAEAAAAIE9NETIUZ2V0X2FjY291bnRfcmVzcG9uc2UAAABYoWmiOQdhc3NldFtdAAAAAF7Ks5oUZ2V0X25ldHdvcmtfcmVzcG9uc2UAAAAA+Firxgx0b2tlbl9zdXBwbHk='
);
export const abi = ABI.from(abiBlob);
export namespace Types {
	@Struct.type('account')
	export class account extends Struct {
		@Struct.field(Name)
		declare account: Name;
	}
	@Struct.type('token_definition')
	export class token_definition extends Struct {
		@Struct.field(Name)
		declare contract: Name;
		@Struct.field(Asset.Symbol)
		declare symbol: Asset.Symbol;
	}
	@Struct.type('balances')
	export class balances extends Struct {
		@Struct.field(Name)
		declare account: Name;
		@Struct.field(token_definition, { array: true })
		declare tokens: token_definition[];
		@Struct.field('bool')
		declare zerobalances: boolean;
	}
	@Struct.type('blockchain_parameters')
	export class blockchain_parameters extends Struct {
		@Struct.field(UInt64)
		declare max_block_net_usage: UInt64;
		@Struct.field(UInt32)
		declare target_block_net_usage_pct: UInt32;
		@Struct.field(UInt32)
		declare max_transaction_net_usage: UInt32;
		@Struct.field(UInt32)
		declare base_per_transaction_net_usage: UInt32;
		@Struct.field(UInt32)
		declare net_usage_leeway: UInt32;
		@Struct.field(UInt32)
		declare context_free_discount_net_usage_num: UInt32;
		@Struct.field(UInt32)
		declare context_free_discount_net_usage_den: UInt32;
		@Struct.field(UInt32)
		declare max_block_cpu_usage: UInt32;
		@Struct.field(UInt32)
		declare target_block_cpu_usage_pct: UInt32;
		@Struct.field(UInt32)
		declare max_transaction_cpu_usage: UInt32;
		@Struct.field(UInt32)
		declare min_transaction_cpu_usage: UInt32;
		@Struct.field(UInt32)
		declare max_transaction_lifetime: UInt32;
		@Struct.field(UInt32)
		declare deferred_trx_expiration_window: UInt32;
		@Struct.field(UInt32)
		declare max_transaction_delay: UInt32;
		@Struct.field(UInt32)
		declare max_inline_action_size: UInt32;
		@Struct.field(UInt16)
		declare max_inline_action_depth: UInt16;
		@Struct.field(UInt16)
		declare max_authority_depth: UInt16;
	}
	@Struct.type('config_row')
	export class config_row extends Struct {
		@Struct.field(Name)
		declare system_contract: Name;
		@Struct.field(Name)
		declare system_contract_msig: Name;
		@Struct.field(Name)
		declare system_token_contract: Name;
		@Struct.field(Asset.Symbol)
		declare system_token_symbol: Asset.Symbol;
		@Struct.field(Asset.Symbol)
		declare system_ramcore_symbol: Asset.Symbol;
		@Struct.field(Asset.Symbol)
		declare system_ram_symbol: Asset.Symbol;
		@Struct.field(Asset.Symbol)
		declare system_rex_symbol: Asset.Symbol;
	}
	@Struct.type('connector')
	export class connector extends Struct {
		@Struct.field(Asset)
		declare balance: Asset;
		@Struct.field(Float64)
		declare weight: Float64;
	}
	@Struct.type('delegated_bandwidth')
	export class delegated_bandwidth extends Struct {
		@Struct.field(Name)
		declare from: Name;
		@Struct.field(Name)
		declare to: Name;
		@Struct.field(Asset)
		declare net_weight: Asset;
		@Struct.field(Asset)
		declare cpu_weight: Asset;
	}
	@Struct.type('eosio_global_state')
	export class eosio_global_state extends blockchain_parameters {
		@Struct.field(UInt64)
		declare max_ram_size: UInt64;
		@Struct.field(UInt64)
		declare total_ram_bytes_reserved: UInt64;
		@Struct.field(Int64)
		declare total_ram_stake: Int64;
		@Struct.field(BlockTimestamp)
		declare last_producer_schedule_update: BlockTimestamp;
		@Struct.field(TimePoint)
		declare last_pervote_bucket_fill: TimePoint;
		@Struct.field(Int64)
		declare pervote_bucket: Int64;
		@Struct.field(Int64)
		declare perblock_bucket: Int64;
		@Struct.field(UInt32)
		declare total_unpaid_blocks: UInt32;
		@Struct.field(Int64)
		declare total_activated_stake: Int64;
		@Struct.field(TimePoint)
		declare thresh_activated_stake_time: TimePoint;
		@Struct.field(UInt16)
		declare last_producer_schedule_size: UInt16;
		@Struct.field(Float64)
		declare total_producer_vote_weight: Float64;
		@Struct.field(BlockTimestamp)
		declare last_name_close: BlockTimestamp;
	}
	@Struct.type('exchange_state')
	export class exchange_state extends Struct {
		@Struct.field(Asset)
		declare supply: Asset;
		@Struct.field(connector)
		declare base: connector;
		@Struct.field(connector)
		declare quote: connector;
	}
	@Struct.type('proposal')
	export class proposal extends Struct {
		@Struct.field(Name)
		declare proposal_name: Name;
		@Struct.field(Bytes)
		declare packed_transaction: Bytes;
		@Struct.field(TimePoint, { optional: true })
		declare earliest_exec_time?: TimePoint;
	}
	@Struct.type('refund_request')
	export class refund_request extends Struct {
		@Struct.field(Name)
		declare owner: Name;
		@Struct.field(TimePointSec)
		declare request_time: TimePointSec;
		@Struct.field(Asset)
		declare net_amount: Asset;
		@Struct.field(Asset)
		declare cpu_amount: Asset;
	}
	@Struct.type('pair_time_point_sec_int64')
	export class pair_time_point_sec_int64 extends Struct {
		@Struct.field(TimePointSec)
		declare first: TimePointSec;
		@Struct.field(Int64)
		declare second: Int64;
	}
	@Struct.type('rex_balance')
	export class rex_balance extends Struct {
		@Struct.field(UInt8)
		declare version: UInt8;
		@Struct.field(Name)
		declare owner: Name;
		@Struct.field(Asset)
		declare vote_stake: Asset;
		@Struct.field(Asset)
		declare rex_balance: Asset;
		@Struct.field(Int64)
		declare matured_rex: Int64;
		@Struct.field(pair_time_point_sec_int64, { array: true })
		declare rex_maturities: pair_time_point_sec_int64[];
	}
	@Struct.type('rex_fund')
	export class rex_fund extends Struct {
		@Struct.field(UInt8)
		declare version: UInt8;
		@Struct.field(Name)
		declare owner: Name;
		@Struct.field(Asset)
		declare balance: Asset;
	}
	@Struct.type('get_account_response')
	export class get_account_response extends Struct {
		@Struct.field(Name)
		declare account: Name;
		@Struct.field(Asset)
		declare balance: Asset;
		@Struct.field(delegated_bandwidth, { array: true })
		declare delegations: delegated_bandwidth[];
		@Struct.field(proposal, { array: true })
		declare proposals: proposal[];
		@Struct.field(refund_request)
		declare refund: refund_request;
		@Struct.field(rex_balance)
		declare rexbal: rex_balance;
		@Struct.field(rex_fund)
		declare rexfund: rex_fund;
	}
	@Struct.type('powerup_state_resource')
	export class powerup_state_resource extends Struct {
		@Struct.field(UInt8)
		declare version: UInt8;
		@Struct.field(Int64)
		declare weight: Int64;
		@Struct.field(Int64)
		declare weight_ratio: Int64;
		@Struct.field(Int64)
		declare assumed_stake_weight: Int64;
		@Struct.field(Int64)
		declare initial_weight_ratio: Int64;
		@Struct.field(Int64)
		declare target_weight_ratio: Int64;
		@Struct.field(TimePointSec)
		declare initial_timestamp: TimePointSec;
		@Struct.field(TimePointSec)
		declare target_timestamp: TimePointSec;
		@Struct.field(Float64)
		declare exponent: Float64;
		@Struct.field(UInt32)
		declare decay_secs: UInt32;
		@Struct.field(Asset)
		declare min_price: Asset;
		@Struct.field(Asset)
		declare max_price: Asset;
		@Struct.field(Int64)
		declare utilization: Int64;
		@Struct.field(Int64)
		declare adjusted_utilization: Int64;
		@Struct.field(TimePointSec)
		declare utilization_timestamp: TimePointSec;
	}
	@Struct.type('powerup_state')
	export class powerup_state extends Struct {
		@Struct.field(UInt8)
		declare version: UInt8;
		@Struct.field(powerup_state_resource)
		declare net: powerup_state_resource;
		@Struct.field(powerup_state_resource)
		declare cpu: powerup_state_resource;
		@Struct.field(UInt32)
		declare powerup_days: UInt32;
		@Struct.field(Asset)
		declare min_powerup_fee: Asset;
	}
	@Struct.type('rex_pool')
	export class rex_pool extends Struct {
		@Struct.field(UInt8)
		declare version: UInt8;
		@Struct.field(Asset)
		declare total_lent: Asset;
		@Struct.field(Asset)
		declare total_unlent: Asset;
		@Struct.field(Asset)
		declare total_rent: Asset;
		@Struct.field(Asset)
		declare total_lendable: Asset;
		@Struct.field(Asset)
		declare total_rex: Asset;
		@Struct.field(Asset)
		declare namebid_proceeds: Asset;
		@Struct.field(UInt64)
		declare loan_num: UInt64;
	}
	@Struct.type('token_supply')
	export class token_supply extends Struct {
		@Struct.field(token_definition)
		declare def: token_definition;
		@Struct.field(Asset)
		declare locked: Asset;
		@Struct.field(Asset)
		declare max: Asset;
		@Struct.field(Asset)
		declare supply: Asset;
	}
	@Struct.type('get_network_response')
	export class get_network_response extends Struct {
		@Struct.field(eosio_global_state)
		declare global: eosio_global_state;
		@Struct.field(powerup_state)
		declare powerup: powerup_state;
		@Struct.field(exchange_state)
		declare ram: exchange_state;
		@Struct.field(rex_pool)
		declare rex: rex_pool;
		@Struct.field(token_supply)
		declare token: token_supply;
	}
	@Struct.type('network')
	export class network extends Struct {}
	@Struct.type('reset')
	export class reset extends Struct {}
	@Struct.type('setconfig')
	export class setconfig extends Struct {
		@Struct.field(Name)
		declare system_contract: Name;
		@Struct.field(Name)
		declare system_contract_msig: Name;
		@Struct.field(Name)
		declare system_token_contract: Name;
		@Struct.field(Asset.Symbol)
		declare system_token_symbol: Asset.Symbol;
	}
	@Struct.type('supply')
	export class supply extends Struct {
		@Struct.field(token_definition)
		declare def: token_definition;
	}
	@Struct.type('wipe')
	export class wipe extends Struct {}
}
export const TableMap = {
	config: Types.config_row
};
export interface TableTypes {
	config: Types.config_row;
}
export type RowType<T> = T extends keyof TableTypes ? TableTypes[T] : any;
export type TableNames = keyof TableTypes;
export namespace ActionParams {
	export namespace Type {
		export interface token_definition {
			contract: NameType;
			symbol: Asset.SymbolType;
		}
	}
	export interface account {
		account: NameType;
	}
	export interface balances {
		account: NameType;
		tokens: Type.token_definition[];
		zerobalances: boolean;
	}
	export interface network {}
	export interface reset {}
	export interface setconfig {
		system_contract: NameType;
		system_contract_msig: NameType;
		system_token_contract: NameType;
		system_token_symbol: Asset.SymbolType;
	}
	export interface supply {
		def: Type.token_definition;
	}
	export interface wipe {}
}
export interface ActionNameParams {
	account: ActionParams.account;
	balances: ActionParams.balances;
	network: ActionParams.network;
	reset: ActionParams.reset;
	setconfig: ActionParams.setconfig;
	supply: ActionParams.supply;
	wipe: ActionParams.wipe;
}
export type ActionNames = keyof ActionNameParams;
export interface ActionReturnValues {
	account: Types.get_account_response;
	balances: Asset[];
	network: Types.get_network_response;
	supply: Types.token_supply;
}
export type ActionReturnNames = keyof ActionReturnValues;
export class Contract extends BaseContract {
	constructor(args: PartialBy<ContractArgs, 'abi' | 'account'>) {
		super({
			client: args.client,
			abi: abi,
			account: args.account || Name.from('unicove.gm')
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
