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
			const marketCapEOSValue =
				(Number(data.network.ramprice?.eos.value || 0) * TOTAL_RAM_SUPPLY) / 1000;
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
	<Card class="flex flex-row">
		<div class="mb-4 w-1/2">
			<div class="h-24">
				<div class="flex flex-col">
					<h1 class="text-xl text-gray-400">Available</h1>
					<AssetText class="text-xl" variant="full" value={ramOwned} />
					<AssetText
						class="text-md text-gray-400"
						variant="full"
						value={data.network.ramprice?.usd &&
							calculateValue(ramOwned, data.network.ramprice?.eos)}
					/>
				</div>
			</div>
			<Button
				variant="outline"
				class="flex-1 bg-blue-500 hover:bg-blue-600"
				href="/{String(data.network)}/ram/sell"
			>
				Sell
			</Button>
		</div>
		<div class="mb-4 w-1/2">
			<div class="h-24">
				<div class="flex flex-col">
					<h1 class="text-xl text-gray-400">Total RAM Value USD</h1>
					<AssetText
						class="text-xl"
						variant="full"
						value={data.network.ramprice?.usd &&
							Asset.from(calculateValue(ramOwned, data.network.ramprice?.usd).value, '2,USD')}
					/>
				</div>
			</div>
			<Button
				variant="outline"
				class="flex-1 bg-blue-500 hover:bg-blue-600"
				href="/{String(data.network)}/ram/buy"
			>
				Buy
			</Button>
		</div>
	</Card>

	<Card class="gap-4">
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

	<Card class="p-4">
		<div></div>
		<!-- <RamPriceHistory data={data.historicalPrices} /> -->
	</Card>

	<Stack class="text-m mb-20">
		<Grid itemWidth="48%">
			<Card>
				<p class="text-gray-400">
					RAM Market Cap {data.network.chain.systemToken?.symbol.code || ''}
				</p>
				<AssetText variant="full" value={marketCapEOS} class="text-right" />
			</Card>
			<Card>
				<p class="text-gray-400">RAM Supply</p>
				<AssetText variant="full" value={ramSupply} class="text-right" />
			</Card>
		</Grid>
		<Card class="w-full">
			<p class="text-gray-400">RAM Market Cap USD</p>
			<AssetText variant="full" value={marketCapUSD} class="text-right" />
		</Card>
	</Stack>
</div>
