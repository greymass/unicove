import { type Action, Asset, Name } from '@wharfkit/antelope';
import { ChainDefinition } from '@wharfkit/common';
import { RentType } from '../types';
import type { Contract } from '@wharfkit/contract';

const defaultName = Name.from('');
const defaultSymbol = Asset.Symbol.from('0,UNKNOWN');
const defaultQuantity = Asset.fromUnits(0, defaultSymbol);

export class RentState {
	public chain: ChainDefinition;
	public rentType: RentType;

	public rentingForSelf = $state(true);
	public thirdReceiver: Name = $state(defaultName);
	public thirdReceiverValid = $state(false);

	public payer: Name = $state(defaultName);
	public receiver: Name = $derived(
		this.rentingForSelf ? this.payer : this.thirdReceiverValid ? this.thirdReceiver : defaultName
	);

	public balance: Asset = $state(defaultQuantity);

	public cpuAmount: number | undefined = $state();
	public netAmount: number | undefined = $state();
	public cpuQuantity: Asset = $derived.by(() => {
		if (this.cpuPricePerMs && this.cpuAmount) {
			return Asset.from(
				Number(this.cpuPricePerMs.value) * Number(this.cpuAmount),
				this.cpuPricePerMs.symbol
			);
		}
		return Asset.from(0, this.chain.systemToken!.symbol);
	});

	public netQuantity: Asset = $derived.by(() => {
		if (this.netPricePerKb && this.netAmount) {
			return Asset.from(
				Number(this.netPricePerKb.value) * Number(this.netAmount),
				this.netPricePerKb.symbol
			);
		}
		return Asset.from(0, this.chain.systemToken!.symbol);
	});

	public cost: Asset = $derived.by(() => {
		return Asset.fromUnits(
			this.cpuQuantity.units.adding(this.netQuantity.units),
			this.cpuQuantity.symbol
		);
	});

	public cpuPricePerMs: Asset | undefined = $state();
	public netPricePerKb: Asset | undefined = $state();

	//set for powerup
	public cpuFrac: number = $state(0);
	public netFrac: number = $state(0);

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

	constructor(chain: ChainDefinition, rent: RentType) {
		this.chain = chain;
		this.rentType = rent;
	}

	public valid: boolean = $derived(
		!!(
			this.cost.value &&
			this.cost.units.lte(this.balance?.units) &&
			this.payer.value &&
			this.receiver.value
		)
	);

	reset() {
		this.payer = defaultName;
		this.balance = defaultQuantity;
		this.cpuAmount = undefined;
		this.netAmount = undefined;
		this.cpuPricePerMs = undefined;
		this.netPricePerKb = undefined;
		this.cpuFrac = 0;
		this.netFrac = 0;
		this.error = '';
	}

	resetBeforeTransction() {
		this.error = '';
	}

	resetAfterTransction() {
		this.cpuAmount = 0;
		this.netAmount = 0;
		this.error = '';
	}

	getActions(contract: Contract): Action[] {
		switch (this.rentType) {
			case RentType.POWERUP:
				return this.getPowerUpActions(contract);
			case RentType.REX:
				return this.getRexActions(contract);
			case RentType.STAKE:
				return this.getStakeActions(contract);
		}
	}

	private getPowerUpActions(contract: Contract): Action[] {
		const rentData = {
			payer: this.payer,
			receiver: this.receiver,
			days: 1,
			net_frac: this.netFrac,
			cpu_frac: this.cpuFrac,
			max_payment: this.cost
		};
		console.log('getPowerUpActions: ', rentData);
		return [contract.action('powerup', rentData)];
	}

	private getRexActions(contract: Contract) {
		let actions = [];
		const depositData = {
			owner: this.payer,
			amount: this.cost || 0
		};
		console.log('depositData: ', depositData);
		const depositAction = contract.action('deposit', {
			owner: this.payer,
			amount: this.cost || 0
		});

		actions.push(depositAction);

		if (this.cpuQuantity.value) {
			const rentCpuData = {
				from: this.payer,
				receiver: this.receiver,
				loan_payment: this.cpuQuantity,
				loan_fund: Asset.fromUnits(0, this.chain.systemToken!.symbol)
			};
			console.log('rentCpuData: ', rentCpuData);
			const rentCpuAction = contract.action('rentcpu', rentCpuData);
			actions.push(rentCpuAction);
		}

		if (this.netQuantity.value) {
			const rentNetData = {
				from: this.payer,
				receiver: this.receiver,
				loan_payment: this.netQuantity,
				loan_fund: Asset.fromUnits(0, this.chain.systemToken!.symbol)
			};
			console.log('rentCpuData: ', rentNetData);
			const rentNetAction = contract.action('rentnet', rentNetData);
			actions.push(rentNetAction);
		}
		return actions;
	}

	private getStakeActions(contract: Contract): Action[] {
		const cpuQuantity = this.cpuQuantity || Asset.fromUnits(0, this.chain.systemToken!.symbol);
		const netQuantity = this.netQuantity || Asset.fromUnits(0, this.chain.systemToken!.symbol);
		const rentData = {
			from: this.payer,
			receiver: this.receiver,
			stake_cpu_quantity: cpuQuantity,
			stake_net_quantity: netQuantity,
			transfer: false
		};
		console.log('getStakeActions: ', rentData);
		return [contract.action('delegatebw', rentData)];
	}
}
