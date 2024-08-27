import { Asset, Name, Serializer } from '@wharfkit/antelope';
import type { ChainDefinition } from '@wharfkit/session';

export class BuyRAMState {
	public payer: Name = $state(Name.from(''));
	public receiver: Name = $state(Name.from(''));
	public bytes: number = $state(0);
	public balance: Asset = $state(Asset.fromUnits(0, '4,EOS'));
	public chain: ChainDefinition | undefined = $state();
	public pricePerKB: Asset = $state(Asset.fromUnits(0, '4,EOS'));

	public pricePerByte: Asset = $derived(
		Asset.fromUnits(this.pricePerKB.value / 1000, this.pricePerKB.symbol)
	);

	public bytesValue: Asset = $derived(
		Asset.from((this.bytes * this.pricePerKB.value) / 1000, this.chain?.systemToken?.symbol)
	);

	public fee: Asset = $derived(
		Asset.from(this.bytesValue.value * 0.05, this.chain?.systemToken?.symbol)
	);

	public bytesCost: Asset = $derived(
		Asset.fromUnits(this.bytesValue.units.adding(this.fee.units), this.chain?.systemToken?.symbol)
	);

	public max: number = $derived(
		this.pricePerKB.value ? Math.floor((this.balance.value * 1000) / this.pricePerKB.value) : 0
	);

	public valid: boolean = $derived(
		!!(this.bytes > 0 && this.bytes <= this.max && this.payer.value && this.receiver.value)
	);

	public insufficientBalance: boolean = $derived(this.bytesValue.value > this.balance.value);

	constructor(chain: ChainDefinition) {
		this.chain = chain;
	}

	reset() {
		this.payer = Name.from('');
		this.receiver = Name.from('');
		this.bytes = 0;
		this.valid = false;
	}

	toJSON() {
		return Serializer.objectify({
			payer: this.payer,
			receiver: this.receiver,
			quant: this.bytesCost
		});
	}

	setBalance(balance: Asset) {
		this.balance = balance;
	}
}
