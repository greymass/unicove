import * as RegistryContract from '$lib/wharf/contracts/registry';
import { Contract as SystemTokenContract } from '$lib/wharf/contracts/token';
import type { UnicoveContext } from '$lib/state/client.svelte';
import { Asset, Name, UInt64, type NameType } from '@wharfkit/antelope';
import type { Contract } from '@wharfkit/contract';

export const createTokenRAMCosts = {
	base: 513,
	perOpen: 240
};

export interface AllocationInput {
	id: number;
	receiver: string;
	receiverValid: boolean;
	quantity: number | undefined;
	quantityValid: boolean;
}

function validateSupply(value: string | number) {
	if (value === '') return false;
	const numValue = Number(value);
	return numValue > 0 && String(UInt64.from(numValue)) === value;
}

function validatePrecision(value: string | number) {
	if (!value || isNaN(Number(value))) return false;
	return Number(value) >= 0 && Number(value) <= 18;
}

export interface InputStateParams {
	ref: HTMLInputElement | undefined;
	validate: (value: string | number) => boolean;
	value: string | number;
}

export interface InputStateContext {
	[key: string]: unknown;
}

export class InputState {
	// Whether the input is valid or not
	valid = $derived.by(() => this.validate(this.value));
	validate: (value: string | number) => boolean;

	// The current value of the input
	value: string | number = $state('');

	// A reference to the input element
	ref: HTMLInputElement | undefined = $state();

	constructor(params: InputStateParams) {
		this.ref = params.ref;
		this.value = params.value;
		this.validate = params.validate;
	}

	toJSON() {
		return {
			valid: this.valid,
			value: this.value
		};
	}
}

export class CreateTokenState {
	public registryContractName: Name = $state(Name.from('registry.gm'));
	public registryContract: RegistryContract.Contract | undefined = $state();
	public registryConfig: RegistryContract.Types.config_row | undefined = $state();

	public tokenStandardContractName: Name = $state(Name.from('tokens.gm'));

	public systemTokenContract: SystemTokenContract | undefined = $state();

	// Token ticker length constraints
	public minlength = $derived(Number(this.registryConfig?.regtoken.minlength) || 1);
	public maxlength = 7;

	public ticker = new InputState({
		validate: (): boolean => this.validateTicker(this.ticker.value),
		value: '',
		ref: undefined
	});

	// Whether this ticker is available to register
	public tickerAvailable = $state(false);

	// Whether an API request is in progress to check if the ticker is available
	public tickerCheck = $state(false);

	public precision = new InputState({
		validate: validatePrecision,
		value: '',
		ref: undefined
	});

	public symbol = $derived.by(() => {
		if (!this.precision.valid || !this.ticker.valid) {
			return undefined;
		}
		return Asset.Symbol.from(`${this.precision.value},${this.ticker.value}`);
	});

	public supply = new InputState({
		validate: validateSupply,
		value: '',
		ref: undefined
	});

	public supplyPreview = $derived.by(() => {
		try {
			return Asset.fromFloat(
				Number(this.supply.value),
				`${this.precision.value},${this.ticker.value}`
			);
		} catch (error) {
			console.error('Error creating supply preview:', error);
			return undefined;
		}
	});

	public allocations: AllocationInput[] = $state([
		{
			id: 1,
			receiver: '',
			// receiver: 'test',
			receiverValid: false,
			quantity: undefined,
			// quantity: 1000,
			quantityValid: false
		}
	]);

	allocationsValidNames = $derived.by(() =>
		this.allocations.every((allocation) =>
			Name.from(allocation.receiver).equals(allocation.receiver)
		)
	);

	allocationsValidQuantities = $derived.by(() =>
		this.allocations.every(
			(allocation) => !isNaN(Number(allocation.quantity)) && Number(allocation.quantity) > 0
		)
	);

	allocationsTotalQuantity = $derived(
		this.allocations.reduce((sum, allocation) => {
			const quantity = Number(allocation.quantity);
			return sum + (isNaN(quantity) ? 0 : quantity);
		}, 0)
	);

	allocationsValidTotalQuantity = $derived(
		this.allocationsTotalQuantity === Number(this.supply.value)
	);

	allocationsValid = $derived.by(
		() =>
			this.allocationsValidNames &&
			this.allocationsValidQuantities &&
			this.allocationsValidTotalQuantity
	);

	allocationIncrement = $state(1);

	valid = $derived(
		this.ticker.valid && this.precision.valid && this.supply.valid && this.allocationsValid
	);

	async init(context: UnicoveContext) {
		this.systemTokenContract = context.network.contracts.token;
		this.registryContractName = context.network.contracts.registry.account;
		this.registryContract = context.network.contracts.registry;
		this.registryConfig = await this.registryContract.table('config').get();
	}

	addAllocation() {
		this.allocationIncrement += 1;
		this.allocations.push({
			id: this.allocationIncrement,
			receiver: '',
			receiverValid: false,
			quantity: undefined,
			quantityValid: false
		});
	}

	removeAllocation(id: number) {
		this.allocations = this.allocations.filter((allocation) => allocation.id !== id);
	}

	validateTicker(value: string | number) {
		const trimmedValue = String(value).trim();
		const minlength = Number(this.registryConfig?.regtoken.minlength) || 1;
		return (
			trimmedValue.length >= minlength && trimmedValue.length <= 7 && /^[A-Z]+$/.test(trimmedValue)
		);
	}

	getActions(actor: NameType, tokenStandardContract: Contract) {
		if (
			!this.systemTokenContract ||
			!this.registryContract ||
			!this.registryConfig ||
			!this.supply ||
			!this.symbol
		) {
			return [];
		}
		const symbol = this.symbol;
		return [
			// Open Balance
			this.registryContract.action('openbalance', {
				account: actor
			}),
			// Transfer fee
			this.systemTokenContract.action('transfer', {
				from: actor,
				to: this.registryContract.account,
				quantity: this.registryConfig.fees.regtoken,
				memo: ''
			}),
			// Register the token
			this.registryContract.action('regtoken', {
				creator: actor,
				ticker: this.ticker.value,
				precision: this.precision.value,
				payment: this.registryConfig.fees.regtoken
			}),
			// Set token contract
			this.registryContract.action('setcontract', {
				ticker: this.ticker.value,
				contract: this.tokenStandardContractName
			}),
			// Set supply
			tokenStandardContract.action('setsupply', {
				ticker: this.ticker.value,
				supply: this.supplyPreview
			}),
			// Open balances for allocations
			...this.allocations.map((allocation) =>
				tokenStandardContract.action('open', {
					owner: allocation.receiver,
					symbol: this.symbol,
					ram_payer: actor
				})
			),
			// Distribute tokens
			tokenStandardContract.action('distribute', {
				ticker: this.ticker.value,
				allocations: this.allocations.map((allocation) => ({
					receiver: allocation.receiver,
					quantity: Asset.fromFloat(Number(allocation.quantity), symbol)
				}))
			})
		];
	}
}
