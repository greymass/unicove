<script lang="ts">
	import { Asset } from '@wharfkit/antelope';

	import AssetInput from '$lib/components/asset/input.svelte';
	import { StringAsset } from '$lib/components/asset/state.svelte';

	let input: AssetInput;

	let value = new StringAsset(Asset.from('1.00000000 TOKEN'));

	$inspect(String(value));
</script>

<a href="/">Home</a>

<p>
	<button onclick={() => (value.asset = Asset.from('2100000000.0000 EOS'))}> EOS (MAX) </button>
	<button onclick={() => (value.asset = Asset.from('46116860184.27387903 WAX'))}>
		WAX (MAX)
	</button>
	<button onclick={() => (value.asset = Asset.from('46116860184.27387903 WAX'))}>
		Broken Value
	</button>
</p>

<AssetInput bind:this={input} autofocus bind:value />

<div>
	<h3>Page State</h3>
	<pre>
Valid Input: {value.isValid()}
Asset: {value.asset}
    </pre>
</div>
