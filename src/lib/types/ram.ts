/* eslint-disable @typescript-eslint/no-namespace */
import { Int64, Name, Struct } from '@wharfkit/antelope';

export namespace Types {
	@Struct.type('ramtransfer')
	export class ramtransfer extends Struct {
		@Struct.field(Name)
		declare from: Name;
		@Struct.field(Name)
		declare to: Name;
		@Struct.field(Int64)
		declare bytes: Int64;
		@Struct.field('string')
		declare memo: string;
	}
}
