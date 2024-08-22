import { Asset, Name, Serializer } from '@wharfkit/antelope';
import type { ChainDefinition } from '@wharfkit/common';

export class BuyRAMState {
	public payer: Name = $state(Name.from(''));
	public receiver: Name = $state(Name.from(''));
	public quant: number;
	public max: number | undefined = $state(undefined);
	readonly chain: ChainDefinition;

	constructor(chain: ChainDefinition) {
		this.chain = chain;
		this.quant = 0;
	}

	reset() {
		this.payer = Name.from('');
		this.receiver = Name.from('');
		this.quant = 0;
		this.max = undefined;
	}

	toJSON() {
		return Serializer.objectify({
			payer: this.payer,
			receiver: this.receiver,
			quant: String(this.quant)
		});
	}
}
