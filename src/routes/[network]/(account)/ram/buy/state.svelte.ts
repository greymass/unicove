import { Asset, Name, Serializer, Int64 } from '@wharfkit/antelope';
import { Chains, type ChainDefinition } from '@wharfkit/session';

const defaultName = Name.from('');
const defaultSymbol = Asset.Symbol.from('0,UNKNOWN');
const defaultQuantity = Asset.fromUnits(0, defaultSymbol);

export class BuyRAMState {
	public payer: Name = $state(defaultName);
	public receiver: Name = $state(defaultName);
	public bytes: number | undefined = $state(undefined);
	public tokens: Asset = $state(defaultQuantity);
	public balance: Asset = $state(defaultQuantity);
	public chain: ChainDefinition = $state(Chains.EOS);
	public pricePerKB: Asset = $state(defaultQuantity);
	public format: 'asset' | 'units' = $state('asset');

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

	public bytesToBuy: number = $derived(
		Number(this.bytes || ((this.bytesValue.value / this.pricePerKB.value) * 1000).toFixed(0))
	);

	public fee: Asset = $derived(
		Asset.from(this.bytesValue.value * 0.005, this.chain?.systemToken?.symbol || '4,EOS')
	);

	public bytesCost: Asset = $derived(
		Asset.fromUnits(
			this.bytesValue.units.adding(this.fee.units),
			this.chain?.systemToken?.symbol || '4,EOS'
		)
	);

	public valid: boolean = $derived(
		!!(
			((this.format === 'units' && this.bytes !== undefined && this.bytes > 0) ||
				(this.format === 'asset' && this.tokens.value > 0)) &&
			this.bytesCost.units.lte(this.balance.units) &&
			this.payer.value &&
			this.receiver.value
		)
	);

	public insufficientBalance: boolean = $derived(
		!this.balance.value || this.bytesValue.value > this.balance.value
	);

	constructor(chain: ChainDefinition) {
		this.chain = chain;
	}

	reset() {
		this.bytes = undefined;
		this.tokens = Asset.fromUnits(0, this.chain.systemToken.symbol);
	}

	toJSON() {
		if (this.format === 'asset') {
			return Serializer.objectify({
				payer: this.payer,
				receiver: this.receiver,
				quant: this.bytesValue
			});
		} else {
			return Serializer.objectify({
				payer: this.payer,
				receiver: this.receiver,
				bytes: Int64.from(this.bytes || 0)
			});
		}
	}

	setBalance(balance: Asset) {
		this.balance = balance;
	}
}
