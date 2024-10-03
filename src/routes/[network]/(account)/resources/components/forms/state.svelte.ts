import { Asset, Name } from '@wharfkit/antelope';
import { ChainDefinition } from '@wharfkit/common';
import { RentType, ResourceType } from '../../types';
import type { ActionNames } from '$lib/wharf/contracts/system';
import { getName, getUnit } from '../../utils';

const defaultName = Name.from('');
const defaultSymbol = Asset.Symbol.from('0,UNKNOWN');
const defaultQuantity = Asset.fromUnits(0, defaultSymbol);

export class RentState {
	public chain: ChainDefinition;
	public resourceType: ResourceType;
	public rentType: RentType;
	public resourceName;
	public resourceUnit;

	public payer: Name = $state(defaultName);
	public receiver: Name = $state(defaultName);

	public balance: Asset | undefined = $state();
	public amount: number | undefined = $state();
	public pricePerUnit: Asset | undefined = $state();
	public cost: Asset = $derived.by(() => {
		if (this.pricePerUnit && this.amount != undefined) {
			return Asset.from(
				Number(this.pricePerUnit.value) * Number(this.amount),
				this.pricePerUnit.symbol
			);
		}
		return Asset.from(0, this.chain.systemToken!.symbol);
	});

	//set for staking
	public quantity: Asset = $state(defaultQuantity);
	//set for powerup
	public frac: number = $state(0);

	//transaction error
	public error: string = $state('');

	public min: number | undefined = $derived(
		this.balance ? Asset.fromUnits(1, this.balance.symbol).value : undefined
	);
	public max: number | undefined = $derived(this.balance ? this.balance.value : undefined);

	public insufficientBalance: boolean = $derived.by(() => {
		if (this.cost && this.balance) return this.cost.value > this.balance.value;
		return false;
	});

	constructor(chain: ChainDefinition, resource: ResourceType, rent: RentType) {
		this.chain = chain;
		this.resourceType = resource;
		this.rentType = rent;
		this.resourceName = getName(resource);
		this.resourceUnit = getUnit(resource);
		this.quantity = Asset.fromUnits(0, this.chain.systemToken!.symbol);
	}

	reset() {
		this.payer = defaultName;
		this.receiver = defaultName;
		this.balance = undefined;
		this.amount = undefined;
		this.pricePerUnit = undefined;
		this.quantity = Asset.from(0, this.chain.systemToken!.symbol);
		this.frac = 0;
		this.error = '';
	}

	resetBeforeTransction() {
		this.error = '';
	}

	resetAfterTransction() {
		this.quantity = Asset.from(0, this.chain.systemToken!.symbol);
		this.amount = undefined;
		this.error = '';
	}

	getActionName(): ActionNames {
		switch (this.rentType) {
			case RentType.REX:
				if (this.resourceType == ResourceType.CPU) {
					return 'rentcpu';
				} else {
					return 'rentnet';
				}
			case RentType.STAKE:
				return 'delegatebw';
			case RentType.POWERUP:
				return 'powerup';
		}
	}

	getDepositData() {
		return {
			owner: this.payer,
			amount: this.cost
		};
	}

	getActionData() {
		switch (this.rentType) {
			case RentType.REX:
				return {
					from: this.payer,
					receiver: this.receiver,
					loan_payment: this.cost,
					loan_fund: Asset.fromUnits(0, this.chain.systemToken!.symbol)
				};
			case RentType.STAKE: {
				const cpuQuantity =
					this.resourceType == ResourceType.CPU
						? this.quantity
						: Asset.fromUnits(0, this.chain.systemToken!.symbol);
				const netQuantity =
					this.resourceType == ResourceType.CPU
						? Asset.fromUnits(0, this.chain.systemToken!.symbol)
						: this.quantity;
				return {
					from: this.payer,
					receiver: this.receiver,
					stake_cpu_quantity: cpuQuantity,
					stake_net_quantity: netQuantity,
					transfer: false
				};
			}
			case RentType.POWERUP: {
				const cpuFrac = this.resourceType == ResourceType.CPU ? this.frac : 0;
				const netFrac = this.resourceType == ResourceType.CPU ? 0 : this.frac;
				return {
					payer: this.payer,
					receiver: this.receiver,
					days: 1,
					net_frac: netFrac,
					cpu_frac: cpuFrac,
					max_payment: this.cost
				};
			}
		}
	}
}
