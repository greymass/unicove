import { Struct } from '@wharfkit/antelope';

@Struct.type('opengraph_image_data')
export class OpengraphImageData extends Struct {
	@Struct.field('string') declare text: string;
	@Struct.field('string') declare title: string;
}
