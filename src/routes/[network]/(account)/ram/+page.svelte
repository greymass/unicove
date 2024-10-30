<script lang="ts">
	import { getContext } from 'svelte';
	import { Asset } from '@wharfkit/antelope';
	import { formatAsset } from '$lib/utils/assets';

	import RamPriceHistory from '$lib/components/chart/rampricehistory.svelte';
	import type { UnicoveContext } from '$lib/state/client.svelte';
	import Card from '$lib/components/layout/box/card.svelte';
	import Button from '$lib/components/button/button.svelte';
	import { calculateValue } from '$lib/utils';
	import { RAMCalculatorState } from './state.svelte';
	import AssetInput from '$lib/components/input/asset.svelte';
	import BytesInput from '$lib/components/input/bytes.svelte';
	import AssetText from '$lib/components/elements/asset.svelte';
	import Stack from '$lib/components/layout/stack.svelte';
	import Item from '$lib/components/select/elements/item.svelte';
	import Grid from '$lib/components/layout/grid.svelte';

	const { data } = $props();
	const context = getContext<UnicoveContext>('state');

	const ramState = $derived(data.network.ramstate);

	let marketCapEOS: Asset | undefined = $state();
	let marketCapUSD: Asset | undefined = $state();
	let ramSupply: Asset | undefined = $state();

	// Hardcoding the total RAM supply to 409.13 GB for now
	const TOTAL_RAM_SUPPLY = 409.13 * 1000 * 1000 * 1000;

	$effect(() => {
		if (ramState) {
			const marketCapEOSValue = Number(data.network.ramprice?.eos.value || 0) * TOTAL_RAM_SUPPLY;
			marketCapEOS = Asset.from(
				marketCapEOSValue,
				data.network.chain.systemToken?.symbol || '0, UNKNOWN'
			);
			const marketCapUSDValue =
				(Number(data.network.ramprice?.usd?.value || 0) * TOTAL_RAM_SUPPLY) / 1000;
			marketCapUSD = Asset.from(marketCapUSDValue, '2,USD');
			ramSupply = Asset.from(TOTAL_RAM_SUPPLY / (1000 * 1000 * 1000), '2,GB');
		}
	});

	let ramOwned = $derived(Asset.from(Number(context.account?.ram?.max || 0) / 1000, '4,KB'));

	const ramCalculatorState = new RAMCalculatorState(data.network.chain);

	$effect(() => {
		if (data.network.ramprice) {
			ramCalculatorState.pricePerKB = data.network.ramprice.eos;
		}
	});

	function setAssetAmount() {
		ramCalculatorState.setAssetAmount(ramCalculatorState.tokens);
	}

	function setBytesAmount() {
		ramCalculatorState.setBytesAmount(ramCalculatorState.bytes || 0);
		assetInput?.set(ramCalculatorState.bytesValue);
	}

	let assetInput: AssetInput;
	let bytesInput: BytesInput;
</script>

<div class="space-y-4 p-4 text-white">
	<div class="p-4">
		<div class="flex flex-col items-start justify-between md:flex-row">
			<div class="mb-4 w-full md:mb-0 md:w-1/2">
				<h1 class="text-xl font-bold">RAM</h1>
				<p class="font-light text-gray-400">Owned</p>
				<p class="text-2xl font-bold text-white">{String(ramOwned) || '0'}</p>
				<div class="mt-4 flex space-x-2">
					<Button
						class="flex-1 bg-blue-500 hover:bg-blue-600"
						href="/{String(data.network)}/ram/buy">Buy</Button
					>
					<Button
						class="flex-1 bg-blue-500 hover:bg-blue-600"
						href="/{String(data.network)}/ram/sell">Sell</Button
					>
				</div>
			</div>
			<div class="mt-4 w-full text-left md:mt-0 md:w-1/2 md:p-8">
				<p class="text-left text-gray-400">Total RAM Value USD</p>
				<p class="text-left text-xl font-bold text-white">
					$ {String(
						context.account?.ram?.max && data.network.ramprice?.usd
							? calculateValue(ramOwned, data.network.ramprice?.usd)
							: '0'
					)}
				</p>
				<hr class="my-2 border-gray-600" />
				<p class="text-left text-gray-400">
					Total RAM Value {data.network.chain.systemToken?.symbol.code || ''}
				</p>
				<p class="text-left text-xl font-bold text-white">
					{String(
						context.account?.ram?.max && data.network.ramprice?.usd
							? calculateValue(ramOwned, data.network.ramprice?.eos)
							: '0'
					)}
				</p>
			</div>
		</div>
	</div>

	<Card class="gap-4 bg-gray-800">
		<h2 class="text-xl font-bold">RAM Calculator</h2>
		<Grid itemWidth="49%">
			<Stack>
				<h2 class="mb-2">{data.network.chain.systemToken?.symbol.code || ''}</h2>
				<AssetInput
					bind:value={ramCalculatorState.tokens}
					bind:this={assetInput}
					oninput={setAssetAmount}
				/>
			</Stack>
			<Stack>
				<h2 class="mb-2">Bytes</h2>
				<BytesInput
					bind:value={ramCalculatorState.bytes}
					bind:this={bytesInput}
					oninput={setBytesAmount}
				/>
			</Stack>
		</Grid>
		<h2 class="text-lg font-bold">Details</h2>
		<Stack class="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
			<p class="text-gray-400">Price</p>
			<AssetText
				class="font-bold"
				variant="full"
				value={ramCalculatorState.tokens || Asset.from('0.0000 EOS')}
			/>

			<div class="col-span-2 my-2 border-b border-gray-600"></div>

			<p class="text-gray-400">Price USD</p>
			<AssetText
				class="font-bold"
				variant="full"
				value={data.network.ramprice?.usd
					? calculateValue(ramCalculatorState.tokens, data.network.ramprice.usd)
					: Asset.from('0.0000 EOS')}
			/>

			<div class="col-span-2 my-2 border-b border-gray-600"></div>

			<p class="text-gray-400">Fees</p>
			<AssetText variant="full" class="font-bold" value={ramCalculatorState.fee} />
		</Stack>
	</Card>

	<Card class="bg-gray-800 p-4">
		<div></div>
		<!-- <RamPriceHistory data={data.historicalPrices} /> -->
	</Card>

	<Stack class="text-m mb-20">
		<Grid itemWidth="45%">
			<Card class="h-32 bg-gray-800">
				<p class="text-left text-gray-400">RAM Market Cap</p>
				<AssetText variant="full" class="font-bold text-white" value={marketCapEOS} />
			</Card>
			<Card class="h-32 bg-gray-800">
				<p class="text-gray-400">RAM Supply</p>
				<AssetText variant="full" class="font-bold text-white" value={ramSupply} />
			</Card>
		</Grid>
		<Card class="w-full bg-gray-800">
			<p class="text-gray-400">USD Market Cap</p>
			<AssetText variant="full" class="font-bold text-white" value={marketCapUSD} />
		</Card>
	</Stack>
</div>
