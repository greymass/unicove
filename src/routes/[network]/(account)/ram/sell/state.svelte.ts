import { Name, Serializer } from '@wharfkit/antelope';
import type { ChainDefinition } from '@wharfkit/session';

export class SellRAMState {
	public account: Name = $state(Name.from(''));
	public bytes: number = $state(0);
	public max: number | undefined = $state(undefined);
	readonly chain: ChainDefinition;

	constructor(chain: ChainDefinition) {
		this.chain = chain;
	}

	reset() {
		this.account = Name.from('');
		this.bytes = 0;
		this.max = undefined;
	}

	toJSON() {
		return Serializer.objectify({
			account: this.account,
			bytes: String(this.bytes)
		});
	}
}
