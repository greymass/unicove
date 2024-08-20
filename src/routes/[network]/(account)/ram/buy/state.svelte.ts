import { Asset, Name, Serializer } from '@wharfkit/antelope';
import type { ChainDefinition } from '@wharfkit/common';

export class BuyRAMState {
	public payer: Name = $state(Name.from(''));
	public receiver: Name = $state(Name.from(''));
	public quant: Asset = $state(Asset.fromUnits(0, '4,UNKNOWN'));
	public max: number | undefined = $state(undefined);
	readonly chain: ChainDefinition;

	constructor(chain: ChainDefinition) {
		this.chain = chain;
		this.quant = Asset.fromUnits(0, chain.systemToken);
	}

	reset() {
		this.payer = Name.from('');
		this.receiver = Name.from('');
		this.quant = Asset.fromUnits(0, this.chain.systemToken);
		this.max = undefined;
	}

	toJSON() {
		return Serializer.objectify({
			payer: this.payer,
			receiver: this.receiver,
			quant: this.quant
		});
	}
}
