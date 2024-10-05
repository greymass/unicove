import { Asset, Name, Serializer, Int64 } from '@wharfkit/antelope';
import { Chains, type ChainDefinition } from '@wharfkit/session';

const defaultName = Name.from('');
const defaultSymbol = Asset.Symbol.from('0,UNKNOWN');
const defaultTokens = Asset.fromUnits(0, defaultSymbol);

export class SellRAMState {
	public account: Name = $state(defaultName);
	public bytes: number | undefined = $state(0);
	public tokens: Asset = $state(defaultTokens);
	public max: number = $state(0);
	public chain: ChainDefinition = $state(Chains.EOS);
	public pricePerKB: Asset = $state(defaultTokens);
	public format: 'asset' | 'bytes' = $state('asset');

	public maxInKBs: Asset = $derived(Asset.fromUnits(this.max, '3,KB'));

	public bytesToSell: number | undefined = $derived(
		this.format === 'bytes'
			? this.bytes || 0
			: Math.floor((this.tokens.value / this.pricePerKB.value) * 1000)
	);

	public kbsToSell: number | undefined = $derived((this.bytesToSell || 0) / 1000);

	public maxValue: Asset = $derived(
		Asset.from(this.max * this.pricePerKB.value, this.pricePerKB.symbol)
	);

	public bytesValue: Asset = $derived(
		this.format === 'bytes' && this.bytes !== undefined
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

	public insufficientRAMForSale: boolean = $derived(
		this.format === 'bytes'
			? this.bytes !== undefined && this.bytes / 1000 > this.max.value
			: this.bytesValue.value > this.max.value * this.pricePerKB.value
	);

	public insufficientRAM: boolean = $derived(!!this.max && this.insufficientRAMForSale);

	public valid: boolean = $derived(
		!!(
			((this.format === 'asset' && this.bytes !== undefined && this.bytes > 0) ||
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
		this.bytes = undefined;
		this.tokens = Asset.fromUnits(0, this.chain.systemToken?.symbol || '0,UNKNOWN');
	}

	toJSON() {
		return Serializer.objectify({
			account: this.account,
			bytes: Int64.from(this.format === 'bytes' ? this.bytes || 0 : this.bytesToSell)
		});
	}
}
