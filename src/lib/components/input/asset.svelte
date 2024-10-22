<script lang="ts">
	import { Asset, Int64 } from '@wharfkit/antelope';
	import type { ComponentProps } from 'svelte';
	import TextInput from './text.svelte';
	import Big from 'big.js';
	import Code from '../code.svelte';

	interface AssetInputProps extends ComponentProps<typeof TextInput> {
		min?: number;
		max?: number;
		valid?: boolean;
		validPrecision?: boolean;
		validMinimum?: boolean;
		validMaximum?: boolean;
		value: Asset;
		debug?: boolean;
	}

	let {
		autofocus = false,
		min = $bindable(),
		max = $bindable(),
		ref = $bindable(),
		valid = $bindable(false),
		validPrecision = $bindable(false),
		validMinimum = $bindable(false),
		validMaximum = $bindable(false),
		value: _value = $bindable(),
		debug = false,
		...props
	}: AssetInputProps = $props();

	/** A zero-value version of the passed in asset for placeholder */
	const zeroValue = $derived(Asset.fromUnits(0, _value.symbol));

	/** The string value bound to the form input */
	let input: string | null = $state(null);

	/** Whether or not the input is a valid number */
	const satisfiesNumber = $derived(!!input && !isNaN(Number(input)));

	/** Use Big.js to accurately convert the string into a usable number*/
	let number = $derived(input && satisfiesNumber ? Big(input) : Big(0));

	/** The number of decimal places used in the string input */
	const decimals = $derived(number.toFixed().split('.')[1]?.length || 0);

	/** The symbol of the asset */
	let symbol: Asset.Symbol = $state(_value.symbol);

	/** The minimum allowed value */
	const minUnits: Int64 = $derived(
		min ? Int64.from(Math.floor(min * Math.pow(10, symbol.precision))) : Int64.from(0)
	);

	/** The maximum allowed value */
	const maxUnits: Int64 = $derived(
		max ? Int64.from(Math.ceil(max * Math.pow(10, symbol.precision))) : Int64.from(0)
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
	export function set(asset: Asset | null) {
		if (!asset) {
			input = null;
		} else {
			symbol = asset.symbol;
			if (asset.value) {
				input = asset.quantity;
			} else {
				input = null;
			}
		}
	}

	/** Set the bindable values on form input changes */
	$effect(() => {
		valid = satisfies;
		validPrecision = satisfiesPrecision;
		validMinimum = satisfiesMinimum;
		validMaximum = satisfiesMaximum;
		if (satisfies) {
			_value = asset;
		} else if (!asset.value && _value.value) {
			_value = zeroValue;
		}
	});

	if (debug) {
		$inspect({
			input,
			number,
			decimals,
			min,
			max,
			symbol,
			precision: symbol.precision,
			formatted,
			asset,
			satisfies,
			satisfiesNumber,
			satisfiesPrecision,
			satisfiesMinimum,
			satisfiesMaximum
		});
	}
</script>

<div class="relative">
	<TextInput
		bind:ref
		bind:value={input}
		placeholder={String(zeroValue.value)}
		{autofocus}
		inputmode="numeric"
		{...props}
	/>

	<span
		class="
				pointer-events-none
				absolute
				inset-y-0
				right-0
				flex
				items-center
				pr-4
				text-gray-500"
	>
		{String(symbol.code)}
	</span>
</div>

{#if debug}
	<h3>Component State</h3>
	<!-- prettier-ignore -->
	<Code>
input (string): "{input}"
input (number): "{number}"
input (decimals): {decimals}
input (min): {min}
input (minUnits): {minUnits}
input (max): {max}
input (maxUnits): {maxUnits}
token symbol: {symbol}
precision: {symbol.precision}
formatted: {formatted}
Asset: {asset}
--- 
Valid Input: {satisfies}
Valid Number: {satisfiesNumber}
Valid Precision: {satisfiesPrecision}
Valid Minimum: {satisfiesMinimum}
Valid Maximum: {satisfiesMaximum}
	</Code>
{/if}
