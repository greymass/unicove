import { Name, Serializer } from '@wharfkit/antelope';
import { Asset, type ChainDefinition } from '@wharfkit/session';

export class SellRAMState {
	public account: Name = $state(Name.from(''));
	public bytes: number | undefined = $state(undefined);
	public max: number = $state(0);
	public chain: ChainDefinition | undefined = $state();
	public pricePerKB: Asset = $state(Asset.fromUnits(0, '4,EOS'));

	public pricePerByte: Asset = $derived(
		Asset.fromUnits(this.pricePerKB.value / 1000, this.pricePerKB.symbol)
	);

	public bytesValue: Asset = $derived(
		this.bytes !== undefined
			? Asset.from(
					this.pricePerKB.value ? (this.bytes * this.pricePerKB.value) / 1000 : 0,
					this.chain?.systemToken?.symbol || '4,EOS'
				)
			: Asset.fromUnits(0, this.chain?.systemToken?.symbol || '4,EOS')
	);

	public fee: Asset = $derived(
		Asset.from(this.bytesValue.value * 0.005, this.chain?.systemToken?.symbol || '4,EOS')
	);

	public expectedToReceive: Asset = $derived(
		Asset.fromUnits(
			this.bytesValue.units.subtracting(this.fee.units),
			this.chain?.systemToken?.symbol || '4,EOS'
		)
	);

	public insufficientRAM: boolean = $derived(this.bytes !== undefined && this.bytes > this.max);

	public valid: boolean = $derived(
		!!(this.bytes !== undefined && this.bytes > 0 && this.bytes <= this.max && this.account.value)
	);

	constructor(chain: ChainDefinition) {
		this.chain = chain;
	}

	reset() {
		this.account = Name.from('');
		this.bytes = undefined;
	}

	toJSON() {
		return Serializer.objectify({
			account: this.account,
			bytes: this.bytes !== undefined ? String(this.bytes) : ''
		});
	}
}
