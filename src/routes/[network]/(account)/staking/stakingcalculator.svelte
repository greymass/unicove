<!-- Staking calculator. -->

<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { Asset } from '@wharfkit/antelope';

	import { Card } from 'unicove-components';
	import AssetInput from '$lib/components/input/asset.svelte';
	import AssetText from '$lib/components/elements/asset.svelte';
	import type { NetworkState } from '$lib/state/network.svelte';
	import * as m from '$lib/paraglide/messages';

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
	let mo = $derived(a / 12);
	let records = $derived.by(() => {
		let daily = Asset.fromUnits(Number(assetValue.units) * d, assetValue.symbol);
		let monthly = Asset.fromUnits(Number(assetValue.units) * mo, assetValue.symbol);
		let yearly = Asset.fromUnits(Number(assetValue.units) * a, assetValue.symbol);
		let price = tokenprice ? tokenprice.value : 0;
		return [
			{
				time: m.common_timeframe_daily(),
				value: daily,
				currency: Asset.from(daily.value * price, tokenprice.symbol)
			},
			{
				time: m.common_timeframe_monthly(),
				value: monthly,
				currency: Asset.from(monthly.value * price, tokenprice.symbol)
			},
			{
				time: m.common_timeframe_yearly(),
				value: yearly,
				currency: Asset.from(yearly.value * price, tokenprice.symbol)
			}
		];
	});
</script>

<Card {...props} class="gap-5" title={m.staking_calculator()}>
	<p>
		{m.staking_calculator_description({
			apr: apr,
			token: String(network.chain.systemToken!.symbol.name)
		})}
	</p>

	<AssetInput min={0} bind:value={assetValue} bind:valid={assetValid} />

	<table class="table-styles">
		<tbody>
			{#each records as record}
				<tr>
					<td class="text-sm">{record.time}</td>
					<td class="text-right text-sm"
						><AssetText class="text-on-surface" variant="full" value={record.value} /></td
					>
					<td class="text-right text-sm">{record.currency}</td>
				</tr>
			{/each}
		</tbody>
	</table>
</Card>
