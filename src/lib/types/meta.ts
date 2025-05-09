import { Name, Struct, UInt64 } from '@wharfkit/antelope';

@Struct.type('meta_tag')
export class MetaTag extends Struct {
	@Struct.field(UInt64) declare id: UInt64;
	@Struct.field(Name) declare tag: Name;
	@Struct.field('string') declare description: string;
}

@Struct.type('meta_taggeg_account')
export class MetaTaggedAccount extends Struct {
	@Struct.field(UInt64) declare account: UInt64;
	@Struct.field(UInt64, { array: true }) declare tags: UInt64[];
}
