import { Asset } from '@wharfkit/antelope';
import { RentType, ResourceType } from '../../types.svelte';

export class RentState {
	public resourceType: ResourceType;
	public rentType: RentType;

	public balance: Asset | undefined = $state();
	public amount: number | undefined = $state();
	public pricePerUnit: Asset | undefined = $state();
	public amountValue: Asset | undefined = $derived.by(() => {
		if (this.pricePerUnit && this.amount != undefined) {
			return Asset.from(
				Number(this.pricePerUnit.value) * Number(this.amount),
				this.pricePerUnit.symbol
			)
		}
		return undefined;
	});

	getUnit(): string {
		return this.resourceType === ResourceType.CPU ? "ms" : "kb";
	}

	public insufficientBalance: boolean = $derived.by(() => {
		if (this.amountValue && this.balance)
			return this.amountValue.value > this.balance.value
		return false;
	});

	constructor(resource: ResourceType, rent: RentType) {
		this.resourceType = resource;
		this.rentType = rent;
	}

	reset() {
		this.balance = undefined;
		this.amount = undefined;
		this.pricePerUnit = undefined;
	}

}
