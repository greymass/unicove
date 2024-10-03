import { Asset, Name, Serializer, Int64 } from '@wharfkit/antelope';
import { Chains, type ChainDefinition } from '@wharfkit/session';

const defaultName = Name.from('');
const defaultSymbol = Asset.Symbol.from('0,UNKNOWN');
const defaultQuantity = Asset.fromUnits(0, defaultSymbol);
const kbsSymbol = Asset.Symbol.from('3,KB');
const defaultKbs = Asset.fromUnits(0, kbsSymbol);

export class SellRAMState {
	public account: Name = $state(defaultName);
	public kbsAmount: Asset = $state(defaultKbs);
	public tokens: Asset = $state(defaultQuantity);
	public max: Asset = $state(defaultQuantity);
	public chain: ChainDefinition = $state(Chains.EOS);
	public pricePerKB: Asset = $state(defaultQuantity);
	public format: 'asset' | 'units' = $state('asset');

	public bytes: number | undefined = $derived(
		this.format === 'units' ? this.kbsAmount.units.value : undefined
	);

	public kbsToSell: Asset = $derived(
		this.format === 'units' || !this.tokens.value || !this.pricePerKB.value
			? this.kbsAmount
			: Asset.fromUnits((this.tokens.value / this.pricePerKB.value) * 1000, kbsSymbol)
	);

	public maxValue: Asset = $derived(
		Asset.from(this.max.value * this.pricePerKB.value, this.pricePerKB.symbol)
	);

	public bytesValue: Asset = $derived(
		this.format === 'units' && this.bytes !== undefined
			? Asset.from(
					(this.bytes * this.pricePerKB.value) / 1000,
					this.chain.systemToken?.symbol || '0,UNKNOWN'
				)
			: this.tokens
	);

	public fee: Asset = $derived(
		Asset.from(this.bytesValue.value * 0.005, this.chain.systemToken?.symbol || '0,UNKNOWN')
	);

	public expectedToReceive: Asset = $derived(
		Asset.fromUnits(
			this.bytesValue.units.subtracting(this.fee.units),
			this.chain.systemToken?.symbol || '0,UNKNOWN'
		)
	);

	readonly insufficientRAMForSale: boolean = $derived(
		this.format === 'units'
			? this.bytes !== undefined && this.kbsAmount.value > this.max.value
			: this.bytesValue.value > this.max.value * this.pricePerKB.value
	);

	public insufficientRAM: boolean = $derived(!!this.max && this.insufficientRAMForSale);

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

		this.reset();
	}

	reset() {
		this.kbsAmount = defaultKbs;
		this.tokens = Asset.fromUnits(0, this.chain.systemToken?.symbol || '0,UNKNOWN');
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
