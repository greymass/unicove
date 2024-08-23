import { Name, Serializer } from '@wharfkit/antelope';
import { Asset, type ChainDefinition } from '@wharfkit/session';

export class SellRAMState {
	public account: Name = $state(Name.from(''));
	public bytes: number = $state(0);
	public max: number = $state(0);
	public valid: boolean = $state(false);
	public chain: ChainDefinition | undefined = $state();
	public pricePerKB: Asset = $state(Asset.fromUnits(0, '4,EOS'));
	public pricePerByte: Asset = $derived(
		Asset.fromUnits(this.pricePerKB.value / 1024, this.pricePerKB.symbol)
	);
	public bytesValue: Asset = $derived(
		Asset.from(
			this.pricePerKB.value ? (this.bytes * this.pricePerKB.value) / 1024 : 0,
			this.chain?.systemToken || '4,EOS'
		)
	);

	constructor(chain: ChainDefinition) {
		this.chain = chain;
	}

	reset() {
		this.account = Name.from('');
		this.bytes = 0;
	}

	toJSON() {
		return Serializer.objectify({
			account: this.account,
			bytes: String(this.bytes)
		});
	}
}
