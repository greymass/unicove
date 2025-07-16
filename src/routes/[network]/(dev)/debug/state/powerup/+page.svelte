<script lang="ts">
	import LineChart from '$lib/components/chart/line-chart.svelte';
	import { Stack } from '$lib/components/layout';
	import type { HistoricalPrice } from '$lib/types.js';
	import { Asset } from '@wharfkit/antelope';
	import { onMount } from 'svelte';

	const { data } = $props();
	const { network } = $derived(data);

	onMount(() => {
		const interval = setInterval(() => {
			network.refresh().then(() => {
				dataRange.unshift({
					date: new Date(),
					value: Asset.from(network.resources.cpu.price.powerup)
				});
			});
		}, 3000);
		network.refresh();
		return () => clearInterval(interval);
	});

	let dataRange: HistoricalPrice[] = $state([]);
	const chartColor = getComputedStyle(document.documentElement)
		.getPropertyValue('--color-success')
		.trim();
</script>

<Stack>
	<header class="flex flex-wrap items-end items-end justify-between gap-6">
		<Stack>
			<h2 class="h2">Powerup State</h2>
		</Stack>
	</header>
	<div class="bg-surface-container rounded-b-lg px-4 py-3 md:rounded-r-lg">
		<table class="table-styles">
			<tbody>
				<tr>
					<td>Network</td>
					<td>{network?.chain.name}</td>
				</tr>
				<tr>
					<td>CPU Price for 1ms</td>
					<td>{network.resources.cpu.price.powerup}</td>
				</tr>
				<tr>
					<td>NET Price for 1kb</td>
					<td>{network.resources.net.price.powerup}</td>
				</tr>
				<tr>
					<td>Last Updated</td>
					<td>{network?.connection.updated}</td>
				</tr>
			</tbody>
		</table>
	</div>
	<div class="canvas-container bg-surface-container relative h-auto w-[99%]">
		<LineChart label="Prices" data={dataRange} color={chartColor} />
	</div>
</Stack>
