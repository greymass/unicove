<script lang="ts">
	import type { AccountValue } from '$lib/state/client/account.svelte';
	import { cn, percentString } from '$lib/utils';
	import { Card } from '../layout';
	import * as m from '$lib/paraglide/messages';

	interface Props {
		data?: AccountValue;
	}
	let { data }: Props = $props();

	const distributionMap = {
		delegated: { label: m.common_delegated(), color: 'bg-mine-300' },
		liquid: { label: m.common_available(), color: 'bg-green-400' },
		ram: { label: 'RAM', color: 'bg-solar-400' },
		staked: { label: m.common_staked(), color: 'bg-sky-400' },
		unstaked: { label: m.common_unstaked(), color: 'bg-sky-400' }
	};

	type DistributionItem = {
		key: keyof typeof distributionMap;
		value: number;
	};

	const distribution: DistributionItem[] = $derived(
		data
			? Object.entries(data)
					.filter(([key]) => Object.keys(distributionMap).includes(key))
					.sort((a, b) => b[1].value - a[1].value)
					.map(
						([key, asset]) =>
							({
								key,
								value: asset.value / data.total.value
							}) as DistributionItem
					)
			: []
	);

	const filtered = $derived(distribution.filter((item) => item.value > 0));
</script>

{#if filtered.length}
	<Card id="distribution" title={m.common_distribution()}>
		<div id="distribution-container" class="flex gap-1">
			{#each filtered as item}
				<div
					id={`distribution-${item.key}`}
					style="width:{percentString(item.value)}"
					class={cn('h-12 rounded-md', distributionMap[item.key].color)}
				></div>
			{/each}
		</div>

		<table class="table-styles">
			<tbody class="text-muted">
				{#each filtered as item}
					<tr data-hover-effect="false">
						<td class="flex items-center gap-2">
							<div class={cn('size-3 rounded-sm', distributionMap[item.key].color)}></div>
							{distributionMap[item.key].label}
						</td>
						<td class="text-right text-white tabular-nums"> {percentString(item.value)} </td>
					</tr>
				{/each}
			</tbody>
		</table>
	</Card>
{/if}
