<script lang="ts">
	import { Asset } from '@wharfkit/antelope';
	import { type ComponentProps } from 'svelte';
	import AssetInput from './asset.svelte';
	import TextInput from './text.svelte';
	import {Button} from 'unicove-components';
	import Cluster from '$lib/components/layout/cluster.svelte';
	import Stack from '$lib/components/layout/stack.svelte';
	import Code from '../code.svelte';

	interface AssetOrUnitsProps extends ComponentProps<typeof TextInput> {
		assetValue: Asset;
		unitsValue: number | undefined;
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
		debug = false,
		...props
	}: AssetOrUnitsProps = $props();

	let assetSymbol: Asset.Symbol = $derived(assetValue.symbol);
	let assetInputRef: HTMLInputElement | undefined = $state();
	let unitsInputRef: HTMLInputElement | undefined = $state();

	function toggleInputType(event: Event) {
		event.preventDefault();

		if (format === 'asset') {
			format = 'units';
			setTimeout(() => unitsInputRef?.focus(), 0);
		} else {
			format = 'asset';
			setTimeout(() => assetInputRef?.focus(), 0);
		}
	}
</script>

<div class="flex flex-col space-y-2">
	{#if format === 'asset'}
		<AssetInput
			bind:value={assetValue}
			bind:ref={assetInputRef}
			{min}
			{max}
			{autofocus}
			{...props}
		/>
	{:else}
		<TextInput
			bind:value={unitsValue}
			bind:ref={unitsInputRef}
			type="number"
			{autofocus}
			{...props}
		/>
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
			<!-- prettier-ignore -->
			<Code>
Input Type: {format === 'asset' ? 'Asset' : 'Units'}
Asset Value: {assetValue}
Units Value: {unitsValue}
Symbol: {assetValue?.symbol.code}
			</Code>
		</div>
	{/if}
</div>
