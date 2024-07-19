<script lang="ts">
	import { Asset } from '@wharfkit/antelope';
	import { StringAsset } from './state.svelte';
	import { onMount } from 'svelte';

	interface AssetInputProps {
		autofocus?: boolean;
		min?: number;
		max?: number;
		valid?: boolean;
		value: Asset;
	}

	let {
		autofocus = false,
		min = undefined,
		max = undefined,
		valid = $bindable(false),
		value = $bindable()
	}: AssetInputProps = $props();

	const stringAsset = $state(new StringAsset(value, { min, max }));
	const zeroValue = $derived(Asset.fromUnits(0, value.symbol));

	export function set(asset: Asset) {
		value = asset;
		stringAsset.input = asset.quantity;
	}

	onMount(() => {
		stringAsset.input = value.quantity;
	});

	$effect(() => {
		valid = stringAsset.valid;
		if (stringAsset.valid) {
			value = stringAsset.asset;
		}
	});

	$inspect(value, min, max);
</script>

<input type="text" bind:value={stringAsset.input} placeholder={zeroValue.quantity} {autofocus} />

<h3>Component State</h3>
<pre>

input (string):   "{stringAsset.input}"
input (decimals): {stringAsset.decimals}
input (min):      {stringAsset.min}
input (max):      {stringAsset.max}
token symbol:     {stringAsset.symbol}
formatted:        {stringAsset.formatted}
Asset:            {stringAsset.asset}
    
---

Valid Input:       {stringAsset.valid}
Valid Number:      {stringAsset.satisfiesNumber}
Valid Precision:   {stringAsset.satisfiesPrecision}
Valid Minimum:     {stringAsset.satisfiesMinimum}
Valid Maximum:     {stringAsset.satisfiesMaximum}
</pre>
