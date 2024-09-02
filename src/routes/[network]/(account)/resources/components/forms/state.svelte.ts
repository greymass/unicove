import { Serializer, Asset, Name } from '@wharfkit/antelope';
import { RentType, ResourceType } from '../../types.svelte';
import type { ActionNames, ActionParams } from '$lib/wharf/contracts/system';


export class RentState {
	public resourceType: ResourceType;
	public rentType: RentType;

	public payer: Name = $state(Name.from(''));
	public receiver: Name = $state(Name.from(''));


	public coreSymbol: Asset.Symbol = $state(Asset.Symbol.from('4,EOS'))
	public balance: Asset | undefined = $state();
	public amount: number | undefined = $state();
	public pricePerUnit: Asset | undefined = $state();
	public cost: Asset = $derived.by(() => {
		if (this.pricePerUnit && this.amount != undefined) {
			return Asset.from(
				Number(this.pricePerUnit.value) * Number(this.amount),
				this.pricePerUnit.symbol
			)
		}
		return Asset.from(0, this.coreSymbol);
	});

	//set for staking
	public amountValue: Asset = $state(Asset.from(0, Asset.Symbol.from('4,EOS')));
	//set for powerup
	public frac: number = $state(0)

	public error: string = $state('')
	public txid: string = $state('')

	getName(): string {
		switch (this.resourceType) {
			case ResourceType.CPU:
				return "CPU";
			case ResourceType.NET:
				return "NET";
		}
	}

	getUnit(): string {
		return this.resourceType === ResourceType.CPU ? "ms" : "kb";
	}

	public insufficientBalance: boolean = $derived.by(() => {
		if (this.cost && this.balance)
			return this.cost.value > this.balance.value
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
		this.amountValue = Asset.from(0, Asset.Symbol.from('4,EOS'));
		this.error = '';
		this.txid = '';
	}

	getActionName(): ActionNames {
		switch (this.rentType) {
			case RentType.REX:
				if (this.resourceType == ResourceType.CPU) {
					return "rentcpu"
				} else {
					return "rentnet"
				}
			case RentType.STAKE:
				return "delegatebw";
			case RentType.POWERUP:
				return "powerup";
		}
	}

	getDepositData() {
		return {
			owner: this.payer,
			amount: this.cost
		}
	}

	getActionData() {
		switch (this.rentType) {
			case RentType.REX:
				return {
					from: this.payer,
					receiver: this.receiver,
					loan_payment: this.cost,
					loan_fund: Asset.fromUnits(0, this.coreSymbol)
				}
			case RentType.STAKE:
				const cpuQuantity = this.resourceType == ResourceType.CPU ? this.amountValue : Asset.fromUnits(0, this.coreSymbol)
				const netQuantity = this.resourceType == ResourceType.CPU ? Asset.fromUnits(0, this.coreSymbol) : this.amountValue;
				return {
					from: this.payer,
					receiver: this.receiver,
					stake_cpu_quantity: cpuQuantity,
					stake_net_quantity: netQuantity,
					transfer: false,
				}
			case RentType.POWERUP:
				const cpuFrac = this.resourceType == ResourceType.CPU ? this.frac : 0
				const netFrac = this.resourceType == ResourceType.CPU ? 0 : this.frac;
				return {
					payer: this.payer,
					receiver: this.receiver,
					days: 1,
					net_frac: netFrac,
					cpu_frac: cpuFrac,
					max_payment: this.cost,
				}
		}

	}
}
