<script lang="ts">
	import { getContext } from 'svelte';
	import { Asset } from '@wharfkit/antelope';

	import RamPriceHistory from '$lib/components/chart/rampricehistory.svelte';
	import type { UnicoveContext } from '$lib/state/client.svelte';
	import Card from '$lib/components/layout/box/card.svelte';
	import Button from '$lib/components/button/button.svelte';
	import { calculateValue } from '$lib/utils';
	import { RAMCalculatorState } from './state.svelte';
	import AccountBalance from '$lib/components/card/accountbalance.svelte';
	import AssetInput from '$lib/components/input/asset.svelte';
	import BytesInput from '$lib/components/input/bytes.svelte';
	import AssetText from '$lib/components/elements/asset.svelte';
	import { MultiCard, Stack } from '$lib/components/layout';
	import Label from '$lib/components/input/label.svelte';

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

	let ramAvailable = $derived(
		Asset.from(Number(context.account?.ram?.available || 0) / 1000, '3,KB')
	);

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

<MultiCard>
	<!-- Buy Sell Card -->
	<Card class="flex *:flex-1">
		<div class="grid content-between gap-4">
			<div class="grid">
				<h3 class="text-muted text-base">RAM Available</h3>
				<AssetText class="text-xl font-semibold" variant="full" value={ramAvailable} />
			</div>
			<Button variant="secondary" href="/{String(data.network)}/ram/buy">Buy</Button>
		</div>

		<div class="grid content-between gap-4">
			<div>
				<h3 class="text-muted text-base">EOS Value</h3>
				<AssetText
					class="text-xl font-semibold"
					variant="full"
					value={data.network.ramprice?.eos &&
						calculateValue(ramAvailable, data.network.ramprice?.eos)}
				/>
				{#if data.network.ramprice?.usd}
					<div>
						<AssetText
							class="text-muted text-base"
							variant="full"
							value={data.network.ramprice?.usd &&
								Asset.from(calculateValue(ramAvailable, data.network.ramprice?.usd).value, '2,USD')}
						/>
					</div>
				{/if}
			</div>
			<Button variant="secondary" href="/{String(data.network)}/ram/sell">Sell</Button>
		</div>
	</Card>

	<AccountBalance />

	<!-- RAM Calculator -->

	<Card class="gap-6" title="RAM Calculator">
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
			<h4 class="text-md font-semibold">Details</h4>
			<table class="">
				<tbody class="*:border-b *:border-mineShaft-900 *:pt-8 last:*:border-b-0 *:even:text-right">
					<tr class="*:py-2">
						<td class="text-muted text-base"> EOS/RAM (KB) </td>
						<td class="text-right font-medium text-white">
							<AssetText
								variant="full"
								value={ramCalculatorState.pricePerKB
									? Asset.from(ramCalculatorState.pricePerKB)
									: Asset.from(0, data.network.chain.systemToken?.symbol || '0,UNKNOWN')}
							/>
						</td>
					</tr>
					{#if data.network.ramprice?.usd}
						<tr class="*:py-2">
							<td class="text-muted text-base"> USD/RAM (KB) </td>
							<td class="text-right font-medium text-white">
								<AssetText
									variant="full"
									value={ramCalculatorState.pricePerKB && data.network.ramprice?.usd
										? data.network.ramprice?.usd
										: Asset.from(0, '2,USD')}
								/>
							</td>
						</tr>
						<tr class="*:py-2">
							<td class="text-muted text-base"> USD Price </td>
							<td class="text-right font-medium text-white">
								<AssetText
									variant="full"
									value={data.network.ramprice?.usd
										? calculateValue(ramCalculatorState.tokens, data.network.ramprice.usd)
										: Asset.from('0.0000 EOS')}
								/>
							</td>
						</tr>
					{/if}
					<tr class="*:py-2">
						<td class="text-muted text-base"> Network Fees </td>
						<td class="text-right font-medium text-white">
							<AssetText variant="full" value={ramCalculatorState.fee} />
						</td>
					</tr>
				</tbody>
			</table>
		</Stack>
	</Card>

	{#if data.historicalPrices.length}
		<div class="lg:col-start-2 lg:row-span-2 lg:row-start-1">
			<RamPriceHistory data={data.historicalPrices} />
		</div>
	{/if}

	<Card>
		<table>
			<tbody class="*:border-b *:border-mineShaft-900 *:pt-8 last:*:border-b-0 *:even:text-right">
				<tr class="*:py-2">
					<td class="text-muted text-base"
						>Market Cap ({data.network.chain.systemToken?.symbol.code || ''})</td
					>
					<td class="text-right font-medium text-white">
						<AssetText variant="full" value={marketCapEOS} />
					</td>
				</tr>
				{#if data.network.ramprice?.usd}
					<tr class="*:py-2">
						<td class="text-muted text-base">Market Cap (USD)</td>
						<td class="text-right font-medium text-white">
							<AssetText variant="full" value={marketCapUSD} />
						</td>
					</tr>
				{/if}
				<tr class="*:py-2">
					<td class="text-muted text-base">Supply</td>
					<td class="text-right font-medium text-white">
						<AssetText variant="full" value={ramSupply} />
					</td>
				</tr>
			</tbody>
		</table>
	</Card>
</MultiCard>
