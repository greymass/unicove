<script lang="ts">
	import type { AccountValue } from '$lib/state/client/account.svelte';
	import { cn, percentString } from '$lib/utils';
	import { Card } from '../layout';

	interface Props {
		data?: AccountValue;
	}
	let { data }: Props = $props();

	const distributionMap = {
		delegated: { label: 'Delegated', color: 'bg-mineShaft-300' },
		liquid: { label: 'Available', color: 'bg-green-400' },
		ram: { label: 'RAM', color: 'bg-solar-400' },
		staked: { label: 'Staked', color: 'bg-skyBlue-400' }
	};

	type DistributionItem = {
		key: keyof typeof distributionMap;
		value: number;
	};

	const distribution = $derived(
		data &&
			Object.entries(data)
				.filter(([key]) => Object.keys(distributionMap).includes(key))
				.sort((a, b) => b[1].value - a[1].value)
				.map(
					([key, asset]) =>
						({
							key,
							value: asset.value / data.total.value
						}) as DistributionItem
				)
	);

	// values under this threshold will not be displayed visually in the chart
	const displayThreshold = 0.0001;
</script>

<Card id="distribution" title="Distribution">
	{#if distribution}
		<div id="distribution-container" class="flex gap-1">
			{#each distribution as item}
				{#if item.value > displayThreshold}
					<div
						id={`distribution-${item.key}`}
						style="width:{percentString(item.value)}"
						class={cn('h-12 rounded-md', distributionMap[item.key].color)}
					></div>
				{/if}
			{/each}
		</div>

		<table class="table-styles">
			<tbody class="text-muted">
				{#each distribution as item}
					<tr data-hover-effect="false">
						<td class="flex items-center gap-2">
							<div class={cn('size-3 rounded', distributionMap[item.key].color)}></div>
							{distributionMap[item.key].label}
						</td>
						<td class="text-right tabular-nums text-white">
							<!-- Will still show something for non-zero values that don't meet the threshold -->
							{item.value <= displayThreshold && item.value > 0
								? '<' + percentString(displayThreshold)
								: percentString(item.value)}
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	{/if}
</Card>
