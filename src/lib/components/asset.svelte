<script lang="ts">
	import { Asset, Int64 } from '@wharfkit/antelope';

	interface AssetInputProps {
		autofocus?: boolean;
		value: Asset;
		valid?: boolean;
	}

	let {
		autofocus = false,
		value = $bindable(),
		valid = $bindable(false)
	}: AssetInputProps = $props();

	class AssetState {
		/** The string value bound to the input */
		input = $state('0');

		/** The number of decimal places used in the string input */
		decimals = $derived(this.input.split('.')[1]?.length || 0);

		/** The derived number value of the bound value */
		number = $derived(Number(this.input));

		/** The symbol of the asset */
		symbol = $state(Asset.Symbol.from('4,TOKEN'));

		/** The derived formatted value of the input */
		formatted = $derived(this.number.toFixed(this.symbol.precision));

		/** The derived Asset */
		asset = $derived(Asset.from(`${this.formatted} ${this.symbol.code}`));

		/** The multiplier used to convert between value and Int64 units */
		multiplier = $derived(Math.pow(10, this.symbol.precision));

		constructor(asset: Asset) {
			this.input = String(asset.quantity);
			this.symbol = asset.symbol;
		}

		toString(): string {
			return String(this.asset);
		}
	}

	const assetState = new AssetState(value);

	function handle(e: KeyboardEvent) {
		const target = e.target as HTMLInputElement;
		if (target && target.value) {
			/**
			 * Update the asset state with the current value of the input field.
			 *
			 * NOTE: This is not a simple bind to `oninput` or `onchange` because
			 * those events will not trigger when entering a `0` character after
			 * the decimal place of the input. So we just process on every keyup
			 * event and manually assign the state.
			 */
			assetState.input = target.value;

			// Input validity checks
			const satisfiesPrecision = assetState.decimals <= assetState.symbol.precision;

			// Update the validity state
			valid = satisfiesPrecision;

			if (valid) {
				value = assetState.asset;
			}
		}
	}
</script>

<input type="number" value={assetState.input} onkeyup={handle} {autofocus} />

<h3>Component State</h3>
<table>
	<tbody>
		<tr>
			<td>input (string)</td>
			<td>{assetState.input}</td>
		</tr>
		<tr>
			<td>value (number)</td>
			<td>{assetState.number}</td>
		</tr>
		<tr>
			<td>symbol (Asset.Symbol)</td>
			<td>{assetState.symbol}</td>
		</tr>
		<tr>
			<td>formatted (string)</td>
			<td>{assetState.formatted}</td>
		</tr>
		<tr>
			<td>multiplier (number)</td>
			<td>{assetState.multiplier}</td>
		</tr>
		<tr>
			<td>asset (Asset)</td>
			<td>{assetState.asset}</td>
		</tr>
	</tbody>
</table>
