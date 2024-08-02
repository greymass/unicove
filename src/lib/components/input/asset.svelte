<script lang="ts">
	import { Asset, Int64 } from '@wharfkit/antelope';
	import type { ComponentProps } from 'svelte';
	import TextInput from './textinput.svelte';
	import Big from 'big.js';

	interface AssetInputProps extends ComponentProps<TextInput> {
		min?: number;
		max?: number;
		valid?: boolean;
		value: Asset;
	}

	let {
		autofocus = false,
		min = $bindable(),
		max = $bindable(),
		valid = $bindable(false),
		value = $bindable()
	}: AssetInputProps = $props();

	/** A zero-value version of the passed in asset for placeholder */
	const zeroValue = $derived(Asset.fromUnits(0, value.symbol));

	/** The string value bound to the form input */
	let input: string | null = $state(null);

	/** Whether or not the input is a valid number */
	const satisfiesNumber = $derived(!!input && !isNaN(Number(input)));

	/** Use Big.js to accurately convert the string into a usable number*/
	let number = $derived(input && satisfiesNumber ? Big(input) : Big(0));

	/** The number of decimal places used in the string input */
	const decimals = $derived(String(number).split('.')[1]?.length || 0);

	/** The symbol of the asset */
	let symbol: Asset.Symbol = $state(Asset.Symbol.from('4,TOKEN'));

	/** The minimum allowed value */
	const minUnits: Int64 = $derived(
		min ? Int64.from(min * Math.pow(10, symbol.precision)) : Int64.from(0)
	);

	/** The maximum allowed value */
	const maxUnits: Int64 = $derived(
		max ? Int64.from(max * Math.pow(10, symbol.precision)) : Int64.from(0)
	);

	/** The derived formatted value of the input */
	const formatted = $derived((satisfiesNumber ? number : 0).toFixed(symbol.precision));

	/** The derived asset from the formatted input */
	const asset: Asset = $derived(Asset.from(`${formatted} ${symbol.code}`));

	/** Validation states */
	const satisfiesPrecision = $derived(decimals <= symbol.precision);
	const satisfiesMinimum = $derived(min === undefined || asset.units.gte(minUnits));
	const satisfiesMaximum = $derived(max === undefined || asset.units.lte(maxUnits));

	/** Whether or not the input value is valid */
	const satisfies = $derived(
		satisfiesNumber && satisfiesPrecision && satisfiesMinimum && satisfiesMaximum
	);

	/** Set the input value from a parent */
	export function set(asset: Asset) {
		symbol = asset.symbol;
		input = asset.quantity;
	}

	/** Set the bindable values on form input changes */
	$effect(() => {
		valid = satisfies;
		if (satisfies) {
			value = asset;
		} else {
			value = zeroValue;
		}
	});
</script>

<TextInput bind:value={input} placeholder={zeroValue.quantity} {autofocus} />

<h3>Component State</h3>
<pre>

input (string):   "{input}"
input (number):   "{number}"
input (decimals): {decimals}
input (min):      {min}
input (max):      {max}
token symbol:     {symbol}
precision:        {symbol.precision}
formatted:        {formatted}
Asset:            {asset}
    
---

Valid Input:       {satisfies}
Valid Number:      {satisfiesNumber}
Valid Precision:   {satisfiesPrecision}
Valid Minimum:     {satisfiesMinimum}
Valid Maximum:     {satisfiesMaximum}
</pre>
