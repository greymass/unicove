<!-- Staking calculator. -->

<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { Asset } from '@wharfkit/antelope';

	import { Card, Switcher, Stack } from '$lib/components/layout';
	import AssetInput from '$lib/components/input/asset.svelte';
	import AssetText from '$lib/components/elements/asset.svelte';
	import type { NetworkState } from '$lib/state/network.svelte';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		apy: string;
		network: NetworkState;
		tokenprice: Asset;
	}

	const { apy, network, tokenprice, ...props }: Props = $props();

	let assetValid: boolean = $state(true);
	let assetValue: asset = $state(Asset.from(0, network.chain.systemToken!.symbol));
	let a = $derived(Number(apy) / 100);
	let d = $derived(a / 365);
	let m = $derived(a / 12);
	let records = $derived.by(() => {
		let daily = Asset.fromUnits(d * assetValue.units, assetValue.symbol);
		let monthly = Asset.fromUnits(m * assetValue.units, assetValue.symbol);
		let yearly = Asset.fromUnits(a * assetValue.units, assetValue.symbol);
		let price = tokenprice ? tokenprice.value : 0;
		return [
			{
				time: 'Daily',
				value: daily,
				usd: Asset.from(daily.value * price, '2,USD')
			},
			{
				time: 'Monthly',
				value: monthly,
				usd: Asset.from(monthly.value * price, '2,USD')
			},
			{
				time: 'Yearly',
				value: yearly,
				usd: Asset.from(yearly.value * price, '2,USD')
			}
		];
	});
</script>

<Card {...props} class="gap-5" title="Staking Calculator">
	<Switcher class="items-center gap-4" threshold="20rem">
		<Stack class="grow-0 gap-0">
			<p class="text-nowrap">APY</p>
			<p class="text-nowrap text-white">
				{apy}%
			</p>
		</Stack>
		<Stack class="grow-0 gap-0">
			<p class="text-nowrap">Staked EOS</p>
			<AssetText class="text-nowrap text-white" variant="full" value={assetValue} />
		</Stack>
		<AssetInput min={0} bind:value={assetValue} bind:valid={assetValid} />
	</Switcher>

	<table class="table-styles">
		<tbody>
			{#each records as record}
				<tr>
					<td class="text-sm">{record.time}</td>
					<td class="text-sm"
						><AssetText class="text-white" variant="full" value={record.value} /></td
					>
					<td class="text-sm"><AssetText class="text-white" variant="full" value={record.usd} /></td
					>
				</tr>
			{/each}
		</tbody>
	</table>
</Card>
