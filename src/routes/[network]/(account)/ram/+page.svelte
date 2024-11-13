<script lang="ts">
	import { getContext } from 'svelte';
	import { Asset } from '@wharfkit/antelope';

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
	import Label from '$lib/components/input/label.svelte';
	import { Grid } from '$lib/components/layout';

	const { data } = $props();
	const context = getContext<UnicoveContext>('state');

	const ramState = $derived(data.network.ramstate);

	let marketCapEOS: Asset | undefined = $state();
	let marketCapUSD: Asset | undefined = $state();
	let ramSupply: Asset | undefined = $state();

	const totalRamSupply = $derived(Number(data.network.globalstate?.max_ram_size || 0));

	$effect(() => {
		if (ramState) {
			const marketCapEOSValue =
				(Number(data.network.ramprice?.eos.value || 0) * totalRamSupply) / 1000;
			marketCapEOS = Asset.from(
				marketCapEOSValue,
				data.network.chain.systemToken?.symbol || '0, UNKNOWN'
			);
			const marketCapUSDValue =
				(Number(data.network.ramprice?.usd?.value || 0) * totalRamSupply) / 1000;
			marketCapUSD = Asset.from(marketCapUSDValue, '2,USD');
			ramSupply = Asset.from(totalRamSupply / (1000 * 1000 * 1000), '2,GB');
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

	const layoutClasses = $derived({
		container: `grid gap-6 ${data.historicalPrices.length ? 'lg:grid-cols-2' : 'max-w-lg'}`,
		calculatorWrapper: `${data.historicalPrices.length ? 'lg:col-start-1 lg:row-span-2' : ''}`,
		statsWrapper: `gap-6 ${data.historicalPrices.length ? 'lg:col-start-2' : ''}`
	});
</script>

<div class={layoutClasses.container}>
	<!-- Buy Sell Card -->
	<Card class="flex *:flex-1">
		<div class="grid content-between gap-4">
			<div class="grid">
				<h3 class="text-muted text-base">Available</h3>
				<AssetText class="text-xl" variant="full" value={ramOwned} />
				<AssetText
					class="text-muted text-base"
					variant="full"
					value={data.network.ramprice?.usd && calculateValue(ramOwned, data.network.ramprice?.eos)}
				/>
			</div>

			<Button variant="secondary" href="/{String(data.network)}/ram/buy">Buy</Button>
		</div>

		<div class="grid content-between gap-4">
			<div>
				<h3 class="text-muted text-base">Total RAM Value</h3>
				<AssetText
					class="text-xl"
					variant="full"
					value={data.network.ramprice?.usd &&
						Asset.from(calculateValue(ramOwned, data.network.ramprice?.usd).value, '2,USD')}
				/>
			</div>

			<Button variant="secondary" href="/{String(data.network)}/ram/sell">Sell</Button>
		</div>
	</Card>

	<!-- RAM Calculator -->
	<div class={layoutClasses.calculatorWrapper}>
		<Card class="gap-6">
			<h3 class="text-xl font-bold">RAM Calculator</h3>
			<div class="flex gap-4 *:flex-1">
				<Stack class="gap-2">
					<Label for="asset-amount" class="leading-none">
						{data.network.chain.systemToken?.symbol.code || ''}
					</Label>
					<AssetInput
						id="asset-amount"
						bind:value={ramCalculatorState.tokens}
						bind:this={assetInput}
						oninput={setAssetAmount}
					/>
				</Stack>

				<Stack class="gap-2">
					<Label for="bytes-amount" class="leading-none">Bytes</Label>
					<BytesInput
						id="bytes-amount"
						bind:value={ramCalculatorState.bytes}
						bind:this={bytesInput}
						oninput={setBytesAmount}
					/>
				</Stack>
			</div>

			<Stack class="gap-2">
				<h4 class="text-xl font-semibold">Details</h4>
				<table class="">
					<tbody
						class="*:border-b *:border-mineShaft-900 *:pt-8 last:*:border-b-0 *:even:text-right"
					>
						<tr class="*:py-2">
							<td class="text-muted text-base"> Price / KB </td>
							<td class="text-right">
								<AssetText
									variant="full"
									value={ramCalculatorState.pricePerKB
										? Asset.from(ramCalculatorState.pricePerKB)
										: Asset.from(0, data.network.chain.systemToken?.symbol || '0,UNKNOWN')}
								/>
							</td>
						</tr>
						<tr class="*:py-2">
							<td class="text-muted text-base"> Price USD / KB </td>
							<td class="text-right">
								<AssetText
									variant="full"
									value={ramCalculatorState.pricePerKB && data.network.ramprice?.usd
										? data.network.ramprice?.usd
										: Asset.from(0, '2,USD')}
								/>
							</td>
						</tr>
						<tr class="*:py-2">
							<td class="text-muted text-base"> Price </td>
							<td class="text-right">
								<AssetText
									variant="full"
									value={ramCalculatorState.tokens || Asset.from('0.0000 EOS')}
								/>
							</td>
						</tr>
						<tr class="*:py-2">
							<td class="text-muted text-base"> Price USD </td>
							<td class="text-right">
								<AssetText
									variant="full"
									value={data.network.ramprice?.usd
										? calculateValue(ramCalculatorState.tokens, data.network.ramprice.usd)
										: Asset.from('0.0000 EOS')}
								/>
							</td>
						</tr>
						<tr class="*:py-2">
							<td class="text-muted text-base"> Fees </td>
							<td class="text-right">
								<AssetText variant="full" value={ramCalculatorState.fee} />
							</td>
						</tr>
					</tbody>
				</table>
			</Stack>
		</Card>
	</div>

	{#if data.historicalPrices.length}
		<div class="lg:col-start-2 lg:row-span-2 lg:row-start-1">
			<RamPriceHistory data={data.historicalPrices} />
		</div>
	{/if}

	<Stack class={layoutClasses.statsWrapper}>
		<Grid class="gap-6">
			<Card>
				<h3 class="text-muted">
					RAM Market Cap {data.network.chain.systemToken?.symbol.code || ''}
				</h3>
				<AssetText variant="full" value={marketCapEOS} class="text-right" />
			</Card>

			<Card>
				<h3 class="text-muted">RAM Supply</h3>
				<AssetText variant="full" value={ramSupply} class="text-right" />
			</Card>
		</Grid>

		<Card>
			<h3 class="text-muted">RAM Market Cap USD</h3>
			<AssetText variant="full" value={marketCapUSD} class="text-right" />
		</Card>
	</Stack>
</div>
