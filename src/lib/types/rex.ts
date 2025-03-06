import { Asset, Int64, Name, Struct, TimePointSec, UInt64, UInt8 } from '@wharfkit/antelope';

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
