import { Asset } from '@wharfkit/antelope';

export class StringAsset {
	/** The string value bound to the input */
	input = $state(0);

	/** The number of decimal places used in the string input */
	decimals = $derived.by(() => {
		console.log(this.input);
		return String(this.input).split('.')[1]?.length || 0;
	});

	/** The symbol of the asset */
	symbol: Asset.Symbol = $state(Asset.Symbol.from('4,TOKEN'));

	/** The derived formatted value of the input */
	formatted = $derived(this.input.toFixed(this.symbol.precision));

	constructor(asset: Asset) {
		this.asset = asset;
	}

	get asset(): Asset {
		return Asset.from(`${this.formatted} ${this.symbol.code}`);
	}

	set asset(asset: Asset) {
		this.input = Number(asset.units.dividing(Math.pow(10, asset.symbol.precision)));
		this.symbol = asset.symbol;
	}

	toString(): string {
		return String(this.asset);
	}

	isValid(): boolean {
		const satisfiesPrecision = this.decimals <= this.symbol.precision;
		return satisfiesPrecision;
	}
}
