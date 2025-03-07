/* eslint-disable @typescript-eslint/no-namespace */
import { Asset, Int64, Name, Struct, TimePointSec, UInt64, UInt8 } from '@wharfkit/antelope';

export namespace Types {
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
	@Struct.type('deposit')
	export class deposit extends Struct {
		@Struct.field(Name)
		declare owner: Name;
		@Struct.field(Asset)
		declare amount: Asset;
	}
	@Struct.type('buyrex')
	export class buyrex extends Struct {
		@Struct.field(Name)
		declare from: Name;
		@Struct.field(Asset)
		declare amount: Asset;
	}
	@Struct.type('sellrex')
	export class sellrex extends Struct {
		@Struct.field(Name)
		declare from: Name;
		@Struct.field(Asset)
		declare rex: Asset;
	}
	@Struct.type('withdraw')
	export class withdraw extends Struct {
		@Struct.field(Name)
		declare owner: Name;
		@Struct.field(Asset)
		declare amount: Asset;
	}
	@Struct.type('mvfrsavings')
	export class mvfrsavings extends Struct {
		@Struct.field(Name)
		declare owner: Name;
		@Struct.field(Asset)
		declare rex: Asset;
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
	@Struct.type('rentcpu')
	export class rentcpu extends Struct {
		@Struct.field(Name)
		declare from: Name;
		@Struct.field(Name)
		declare receiver: Name;
		@Struct.field(Asset)
		declare loan_payment: Asset;
		@Struct.field(Asset)
		declare loan_fund: Asset;
	}
	@Struct.type('rentnet')
	export class rentnet extends Struct {
		@Struct.field(Name)
		declare from: Name;
		@Struct.field(Name)
		declare receiver: Name;
		@Struct.field(Asset)
		declare loan_payment: Asset;
		@Struct.field(Asset)
		declare loan_fund: Asset;
	}
}
