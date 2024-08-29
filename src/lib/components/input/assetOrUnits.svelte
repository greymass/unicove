<script lang="ts">
	import { Asset } from '@wharfkit/antelope';
	import AssetInput from './asset.svelte';
	import TextInput from './text.svelte';
	import Button from '../button/button.svelte';
	import Cluster from '../layout/cluster.svelte';
	import Stack from '../layout/stack.svelte';

	interface AssetOrUnitsProps {
		assetValue: Asset;
		unitsValue: number;
		unitName: string;
		format: 'asset' | 'units';
		min?: number;
		max?: number;
		debug?: boolean;
		autofocus?: boolean;
	}

	let {
		assetValue = $bindable(),
		unitsValue = $bindable(),
		format = $bindable(),
		unitName,
		min,
		max,
		autofocus,
		debug = false
	}: AssetOrUnitsProps = $props();

	let assetSymbol: Asset.Symbol = $derived(assetValue.symbol);

	function toggleInputType() {
		if (format === 'asset') {
			format = 'units';
		} else {
			format = 'asset';
		}
	}
</script>

<div class="flex flex-col space-y-2">
	{#if format === 'asset'}
		<AssetInput bind:value={assetValue} {min} {max} {autofocus} />
	{:else}
		<TextInput bind:value={unitsValue} type="number" {autofocus} />
	{/if}

	<div class="flex items-center space-x-2">
		<Cluster>
			<Stack>
				<Button variant="pill" active={format === 'asset'} onclick={toggleInputType}>
					{assetSymbol.code}
				</Button>
			</Stack>
			<Stack>
				<Button variant="pill" active={format === 'units'} onclick={toggleInputType}
					>{unitName}</Button
				>
			</Stack>
		</Cluster>
	</div>

	{#if debug}
		<div class="mt-4">
			<h3>Component State</h3>
			<pre>
                Input Type: {format === 'asset' ? 'Asset' : 'Units'}
                Asset Value: {assetValue}
                Units Value: {unitsValue}
                Symbol: {assetValue?.symbol.code}
			</pre>
		</div>
	{/if}
</div>
