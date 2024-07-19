import { Asset, Int64 } from '@wharfkit/antelope';

interface StringAssetOptions {
	/** The minimum allowed value */
	min?: number;

	/** The maximum allowed value */
	max?: number;
}

export class StringAsset {
	/** The string value bound to the form input */
	input: string | null = $state(null);

	/** The number of decimal places used in the string input */
	decimals = $derived(String(this.input).split('.')[1]?.length || 0);

	/** The symbol of the asset */
	symbol: Asset.Symbol = $state(Asset.Symbol.from('4,TOKEN'));

	/** The derived formatted value of the input */
	formatted = $derived.by(() =>
		Number(this.satisfiesNumber ? this.input : 0).toFixed(this.symbol.precision)
	);

	/** The minimum allowed value */
	min: number | undefined = $state(undefined);
	minUnits: Int64 = $derived(
		this.min ? Int64.from(this.min * Math.pow(10, this.symbol.precision)) : Int64.from(0)
	);

	/** The maximum allowed value */
	max: number | undefined = $state(undefined);
	maxUnits: Int64 = $derived(
		this.max ? Int64.from(this.max * Math.pow(10, this.symbol.precision)) : Int64.from(0)
	);

	/** Validation states */
	satisfiesNumber = $derived(!isNaN(Number(this.input)));
	satisfiesPrecision = $derived(this.decimals <= this.symbol.precision);
	satisfiesMinimum = $derived(this.min === undefined || this.asset.units.gte(this.minUnits));
	satisfiesMaximum = $derived(this.max === undefined || this.asset.units.lte(this.maxUnits));

	/** Whether or not the input value is valid */
	valid = $derived(
		this.satisfiesNumber &&
			this.satisfiesPrecision &&
			this.satisfiesMinimum &&
			this.satisfiesMaximum
	);

	constructor(asset: Asset, options: StringAssetOptions = {}) {
		this.symbol = asset.symbol;
		this.input = asset.quantity;

		if (asset.units.equals(0)) {
			this.input = null;
		} else {
			this.input = asset.quantity;
		}

		this.min = options.min;
		this.max = options.max;
	}

	get asset(): Asset {
		return Asset.from(`${this.formatted} ${this.symbol.code}`);
	}

	toString(): string {
		return String(this.asset);
	}
}
