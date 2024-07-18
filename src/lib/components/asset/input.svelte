<script lang="ts">
	import { StringAsset } from './state.svelte';

	interface AssetInputProps {
		autofocus?: boolean;
		value: StringAsset;
	}

	let { autofocus = false, value = $bindable() }: AssetInputProps = $props();

	$inspect(String(value));
</script>

<input type="number" bind:value={value.input} {autofocus} />

<h3>Component State</h3>
<pre>
Valid Input:    {value.isValid()}
input (number): {value.input}
symbol:         {value.symbol}
formatted:      {value.formatted}
Asset:          {value.asset}
</pre>
