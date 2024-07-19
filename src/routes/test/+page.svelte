<script lang="ts">
	import { Asset } from '@wharfkit/antelope';

	import AssetInput from '$lib/components/inputs/asset.svelte';

	let input: AssetInput;

	let value = $state(Asset.from('0.0000 TOKEN'));
	let valid = $state(false);

	let min = $state(1);
	let max = $state(100);
</script>

<a href="/">Home</a>

<p>
	<button onclick={() => input.set(Asset.from('0.0000 EOS'))}> EOS (0) </button>
	<button onclick={() => input.set(Asset.from('1.0000 EOS'))}> EOS (1) </button>
	<button onclick={() => input.set(Asset.from('2100000000.0000 EOS'))}> EOS (MAX) </button>

	<button onclick={() => input.set(Asset.from('46116860184.27387903 WAX'))}> WAX (MAX) </button>
	<button onclick={() => input.set(Asset.from('0 FOO'))}>No Decimals </button>
	<button onclick={() => input.set(Asset.from('4611686018427387903 TEST'))}>
		Maximum No Decimals
	</button>
	<button onclick={() => input.set(Asset.from('461168601842738.7903 TEST'))}>
		Maximum 4 Decimals
	</button>
	<button onclick={() => input.set(Asset.from('46116860184.27387903 TEST'))}>
		Maximum 8 Decimals
	</button>
</p>

<div>
	<label>
		Minimum
		<input type="number" bind:value={min} />
	</label>
</div>

<div>
	<label>
		Maximum
		<input type="number" bind:value={max} />
	</label>
</div>

<button type="button" disabled={!valid} onclick={() => alert(value)}
	>Do a thing with the token!</button
>

<div>
	<label>
		Enter token value:
		<AssetInput bind:this={input} autofocus bind:value bind:valid bind:min bind:max />
	</label>
</div>

<div>
	<h3>Page State</h3>
	<pre>
Valid Input: {valid}
Asset: {value}
    </pre>
</div>
