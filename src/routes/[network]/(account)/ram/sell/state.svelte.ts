import { Asset, Name, Serializer, Int64 } from '@wharfkit/antelope';
import { Chains, type ChainDefinition } from '@wharfkit/session';

const defaultName = Name.from('');
const defaultSymbol = Asset.Symbol.from('0,UNKNOWN');
const defaultQuantity = Asset.fromUnits(0, defaultSymbol);

export class SellRAMState {
	public account: Name = $state(defaultName);
	public bytes: number | undefined = $state(undefined);
	public tokens: Asset = $state(defaultQuantity);
	public max: number = $state(0);
	public chain: ChainDefinition = $state(Chains.EOS);
	public pricePerKB: Asset = $state(defaultQuantity);
	public format: 'asset' | 'units' = $state('asset');

	public bytesToSell: number = $derived(
		this.format === 'units'
			? this.bytes || 0
			: Math.floor((this.tokens.value * 1000) / this.pricePerKB.value)
	);

	public maxValue: Asset = $derived(
		Asset.fromUnits((this.max * this.pricePerKB.units.value) / 1000, this.pricePerKB.symbol)
	);

	public pricePerByte: Asset = $derived(
		Asset.fromUnits(this.pricePerKB.value / 1000, this.pricePerKB.symbol)
	);

	public bytesValue: Asset = $derived(
		this.format === 'units' && this.bytes !== undefined
			? Asset.from(
					(this.bytes * this.pricePerKB.value) / 1000,
					this.chain?.systemToken?.symbol || '4,EOS'
				)
			: this.tokens
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

	readonly insufficientRAMForSale: boolean = $derived(
		this.format === 'units'
			? this.bytes !== undefined && this.bytes > this.max
			: this.bytesValue.value > (this.max * this.pricePerKB.value) / 1000
	);

	public insufficientRAM: boolean = $derived(!this.max || this.insufficientRAMForSale);

	public valid: boolean = $derived(
		!!(
			((this.format === 'units' && this.bytes !== undefined && this.bytes > 0) ||
				(this.format === 'asset' && this.tokens.value > 0)) &&
			!this.insufficientRAM &&
			this.account.value
		)
	);

	constructor(chain: ChainDefinition) {
		this.chain = chain;
	}

	reset() {
		this.bytes = undefined;
		this.tokens = Asset.fromUnits(0, this.chain?.systemToken?.symbol || '4,EOS');
	}

	toJSON() {
		return Serializer.objectify({
			account: this.account,
			bytes: Int64.from(
				this.format === 'units'
					? this.bytes || 0
					: Math.floor((this.tokens.value * 1000) / this.pricePerKB.value)
			)
		});
	}
}
