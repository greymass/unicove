<script lang="ts">
	import type { AccountValue } from '$lib/state/client/account.svelte';
	import { cn, percentString } from '$lib/utils';
	import { Card } from 'unicove-components';
	import { DD, DL, DLRow } from 'unicove-components';

	interface Props {
		data?: AccountValue;
	}
	let { data }: Props = $props();

	const distributionMap = {
		delegated: { label: 'Delegated', color: 'bg-mine-300' },
		liquid: { label: 'Available', color: 'bg-success' },
		ram: { label: 'KB (RAM)', color: 'bg-solar-400' },
		staked: { label: 'Staked', color: 'bg-sky-400' },
		unstaked: { label: 'Unstaked', color: 'bg-sky-600' }
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
	<Card id="distribution" title="Distribution">
		<div id="distribution-container" class="flex gap-1">
			{#each filtered as item}
				<div
					id={`distribution-${item.key}`}
					style="width:{percentString(item.value)}"
					class={cn('h-12 rounded-md', distributionMap[item.key].color)}
				></div>
			{/each}
		</div>

		<DL>
			{#each filtered as item}
				<DLRow>
					{#snippet title()}
						<div class="flex items-center gap-2">
							<div class={cn('size-3 rounded-sm', distributionMap[item.key].color)}></div>
							{distributionMap[item.key].label}
						</div>
					{/snippet}
					<DD class="text-on-surface text-right tabular-nums">{percentString(item.value)}</DD>
				</DLRow>
			{/each}
		</DL>
	</Card>
{/if}
