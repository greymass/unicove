import { Asset, Name, Serializer } from '@wharfkit/antelope';

export class SendState {
	public from: Name = $state(Name.from(''));
	public to: Name = $state(Name.from(''));
	public quantity: Asset = $state(Asset.from('0.0000 UNKNOWN'));
	public memo: string = $state('');

	public max: number | undefined = $state(undefined);

	reset() {
		this.from = Name.from('');
		this.to = Name.from('');
		this.quantity = Asset.from('0.0000 UNKNOWN');
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
