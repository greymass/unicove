import { calculateValue } from '$lib/state/client/account.svelte';
import type { NetworkState } from '$lib/state/network.svelte';
import { Asset, Name, Serializer } from '@wharfkit/antelope';
import type { ChainDefinition } from '@wharfkit/common';

export class SendState {
	public from: Name = $state(Name.from(''));
	public to: Name = $state(Name.from(''));
	public quantity: Asset = $state(Asset.fromUnits(0, '4,UNKNOWN'));
	public memo: string = $state('');

	public price: Asset | undefined = $state();
	public value: Asset | undefined = $derived(
		this.price ? calculateValue(this.quantity, this.price) : undefined
	);

	public max: number | undefined = $state(undefined);

	readonly chain: ChainDefinition;

	constructor(network: NetworkState) {
		this.chain = network.chain;
		this.price = network.tokenprice;
		this.quantity = Asset.fromUnits(0, network.chain.systemToken);
	}

	reset() {
		this.from = Name.from('');
		this.to = Name.from('');
		this.quantity = Asset.fromUnits(0, this.chain.systemToken);
		this.memo = '';
		this.max = undefined;
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
