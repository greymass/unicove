import { Asset, Int64, Struct } from '@wharfkit/session';

@Struct.type('powupresult')
export class powupresult extends Struct {
	@Struct.field(Asset)
	declare fee: Asset;
	@Struct.field(Int64)
	declare powup_net: Int64;
	@Struct.field(Int64)
	declare powup_cpu: Int64;
}
