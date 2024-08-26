import { calculateValue } from '$lib/state/client/account.svelte';
import { Asset, Name, Serializer } from '@wharfkit/antelope';
import { TokenBalance, TokenIdentifier, TokenMeta } from '@wharfkit/common';

const defaultSymbol = Asset.Symbol.from('0,UNKNOWN');
export const defaultQuantity = Asset.fromUnits(0, defaultSymbol);
const defaultBalance = TokenBalance.from({
	asset: defaultQuantity,
	contract: '',
	metadata: TokenMeta.from({
		id: TokenIdentifier.from({
			chain: '0000000000000000000000000000000000000000000000000000000000000000',
			contract: '',
			symbol: defaultSymbol
		})
	})
});

export class SendState {
	public from: Name = $state(Name.from(''));
	public to: Name = $state(Name.from(''));
	public quantity: Asset = $state(defaultQuantity);
	public memo: string = $state('');

	public balance: TokenBalance = $state(defaultBalance);
	public price: Asset | undefined = $state();
	public value: Asset | undefined = $derived(
		this.price ? calculateValue(this.quantity, this.price) : undefined
	);

	public min: number | undefined = $derived(
		this.balance ? Asset.fromUnits(1, this.balance.asset.symbol).value : undefined
	);
	public max: number | undefined = $derived(this.balance ? this.balance.asset.value : undefined);

	reset() {
		this.from = Name.from('');
		this.to = Name.from('');
		this.quantity = defaultQuantity;
		this.memo = '';
		this.balance = defaultBalance;
	}

	toJSON() {
		return Serializer.objectify({
			from: this.from,
			to: this.to,
			quantity: this.quantity,
			memo: this.memo
		});
	}
}
