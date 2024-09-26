<!-- TODO: Make a generic line chart component that can be reused for different data sets -->
<!-- Then this component would be a wrapper around that generic line chart component -->

<script lang="ts">
	import { onMount } from 'svelte';
	import dayjs from 'dayjs';
	import { Chart } from 'chart.js';
	import 'chart.js/auto';
	import { Card, Stack } from '$lib/components/layout';
	import { Asset } from '@wharfkit/antelope';
	import Select from '../select/select.svelte';
	import type { ExtendedSelectOption } from '../select/types';

	interface Props {
		data: { date: Date; value: Asset }[];
		debug?: boolean;
	}

	let { data, debug = true }: Props = $props();

	let ctx: HTMLCanvasElement;
	let chart: Chart<'line'>;

	const range: ExtendedSelectOption[] = [
		{ label: '1D', value: 1 },
		{ label: '1W', value: 7 },
		{ label: '1M', value: 30 },
		{ label: '1Y', value: 365 }
	];

	let selectedRange: ExtendedSelectOption = $state(range[1]);

	let dataRange = $derived.by(() => {
		// Seeing a weird bug with svelte where this component is rerendered with data being undefined.
		// This is a workaround to prevent the component from breaking the page.
		if (!data || data.length === 0) return [];
		const rangeEndDate = dayjs(data[0].date);
		const rangeStartDate = rangeEndDate.subtract(Number(selectedRange.value), 'day');
		if (debug) $inspect({ rangeStartDate, rangeEndDate });
		return data.filter(({ date }) => dayjs(date).isAfter(rangeStartDate));
	});

	let currentPoint = $derived(dataRange[0]);
	let currentPrice = $derived(String(currentPoint.value));

	let percentChange = $derived.by(() => {
		if (!currentPoint || !dataRange[dataRange.length - 1]) return '0%';
		const current = Number(currentPoint.value.quantity);
		const initial = Number(dataRange[dataRange.length - 1].value.quantity);
		return (((current - initial) / current) * 100).toFixed(2) + '%';
	});

	const labels = $derived(dataRange.map(({ date }) => String(date.toLocaleDateString())));
	const values = $derived(dataRange.map(({ value }) => Number(value.quantity)));

	onMount(() => {
		chart = new Chart(ctx, {
			type: 'line',
			data: {
				labels: labels,
				datasets: [
					{
						label: 'RAM',
						data: values,
						fill: false,
						borderColor: '#00ED97',
						pointBorderWidth: 0
					}
				]
			},
			options: {
				normalized: true,
				responsive: true,
				interaction: {
					mode: 'x',
					intersect: false
				},
				scales: {
					x: {
						reverse: true,
						border: {
							display: false
						},
						grid: {
							display: false
						},
						ticks: {
							display: false
						}
					},
					y: {
						border: {
							display: false
						},
						grid: {
							display: false
						}
					}
				},
				plugins: {
					legend: {
						display: false
					}
				}
			}
		});
	});

	$effect(() => {
		chart.data.labels = labels;
		chart.data.datasets[0].data = values;
		chart.update();
	});

	if (debug) {
		$inspect({ dataRangeLength: dataRange.length, currentDate: currentPoint?.date, percentChange });
	}
</script>

<Card>
	<header class="flex justify-between">
		<Stack class="gap-0">
			<p class="h4 font-semibold text-white/50">RAM Price - EOS</p>
			<p class="h3 font-semibold">{currentPrice}</p>
			<p class="h4 font-semibold text-white/50">{percentChange}</p>
		</Stack>
		<Select id="range-select" options={range} bind:selected={selectedRange} />
	</header>
	<canvas bind:this={ctx}></canvas>
	<hr class="h-px border-0 bg-shark-200/50" />
	<div class="flex items-center justify-between font-medium">
		<span class="text-shark-200/70">{data[data.length - 1].date.toLocaleDateString()}</span>
		<div class="flex gap-4">
			<div class="flex items-center gap-1">
				<div class="size-4 rounded bg-[#00ED97]"></div>
				<span class="text-[#00ED97]">RAM</span>
			</div>
		</div>
		<span class="text-shark-200/70">Today</span>
	</div>
</Card>
