<!-- Staking calculator. -->

<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { Asset } from '@wharfkit/antelope';

	import { Card, Switcher, Stack } from '$lib/components/layout';
	import AssetInput from '$lib/components/input/asset.svelte';
	import AssetText from '$lib/components/elements/asset.svelte';
	import type { NetworkState } from '$lib/state/network.svelte';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		apr: string;
		network: NetworkState;
		tokenprice: Asset;
	}

	const { apr, network, tokenprice, ...props }: Props = $props();

	let assetValid: boolean = $state(true);
	let assetValue: Asset = $state(Asset.from(0, network.chain.systemToken!.symbol));
	let a = $derived(Number(apr) / 100);
	let d = $derived(a / 365);
	let m = $derived(a / 12);
	let records = $derived.by(() => {
		let daily = Asset.fromUnits(Number(assetValue.units) * d, assetValue.symbol);
		let monthly = Asset.fromUnits(Number(assetValue.units) * m, assetValue.symbol);
		let yearly = Asset.fromUnits(Number(assetValue.units) * a, assetValue.symbol);
		let price = tokenprice ? tokenprice.value : 0;
		return [
			{
				time: 'Daily',
				value: daily,
				usd: '$' + Asset.from(daily.value * price, '2,USD').value.toFixed(2)
			},
			{
				time: 'Monthly',
				value: monthly,
				usd: '$' + Asset.from(monthly.value * price, '2,USD').value.toFixed(2)
			},
			{
				time: 'Yearly',
				value: yearly,
				usd: '$' + Asset.from(yearly.value * price, '2,USD').value.toFixed(2)
			}
		];
	});
</script>

<Card {...props} class="gap-5" title="Staking Calculator">
	<p>
		Enter an amount of {network.chain.systemToken?.symbol.code} to calculate estimated rewards based
		on the current APR of {apr}%. This rate will change over time based on the amount of tokens
		staked.
	</p>

	<AssetInput min={0} bind:value={assetValue} bind:valid={assetValid} />

	<table class="table-styles">
		<tbody>
			{#each records as record}
				<tr>
					<td class="text-sm">{record.time}</td>
					<td class="text-right text-sm"
						><AssetText class="text-white" variant="full" value={record.value} /></td
					>
					<td class="text-right text-sm">{record.usd}</td>
				</tr>
			{/each}
		</tbody>
	</table>
</Card>
