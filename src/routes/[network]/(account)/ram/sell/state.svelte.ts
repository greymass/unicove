import { Name, Serializer } from '@wharfkit/antelope';
import { Asset, type ChainDefinition } from '@wharfkit/session';

export class SellRAMState {
	public account: Name = $state(Name.from(''));
	public bytes: Asset = $state(Asset.from(0, 'BYTES'));
	public max: number | undefined = $state(undefined);
	readonly chain: ChainDefinition;

	constructor(chain: ChainDefinition) {
		this.chain = chain;
	}

	reset() {
		this.account = Name.from('');
		this.bytes = Asset.from(0, 'BYTES');
		this.max = undefined;
	}

	toJSON() {
		return Serializer.objectify({
			account: this.account,
			bytes: String(this.bytes)
		});
	}
}
