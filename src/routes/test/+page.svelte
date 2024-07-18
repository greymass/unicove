<script>
	import { Asset } from '@wharfkit/antelope';

	import Language from '$lib/components/language.svelte';
	import AssetInput from '$lib/components/asset.svelte';

	let value = $state(Asset.from('0.0000 TOKEN'));
	let valid = $state(false);
</script>

<Language />

<a href="/">Home</a>

<div>
	<h3>Page State</h3>
	<p>Valid Input: {valid}</p>
	<p>Asset: {value}</p>
	<p>Symbol: {value.symbol}</p>
	<p>Value: {value.value}</p>
	<p>Quantity: {value.quantity}</p>
</div>

<AssetInput bind:value bind:valid autofocus />
