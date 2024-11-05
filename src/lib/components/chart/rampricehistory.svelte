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
	}

	let { data }: Props = $props();

	let ctx: HTMLCanvasElement;
	let chart: Chart<'line'>;

	const range: ExtendedSelectOption[] = [
		{ label: '1D', value: 1 },
		{ label: '1W', value: 7 },
		{ label: '1M', value: 30 },
		{ label: '1Y', value: 365 }
	];

	let selectedRange: ExtendedSelectOption = $state(range[1]);

	// Calculate points to display based on range
	const POINTS_TO_DISPLAY = 50;

	let dataRange = $state([]);

	let currentPoint = $derived(dataRange[0]);
	let currentPrice = $derived(String(currentPoint?.value));

	let percentChange = $derived.by(() => {
		if (!currentPoint || dataRange.length === 0) return '0.00%';
		const current = Number(currentPoint.value.quantity);
		const initial = Number(dataRange[dataRange.length - 1].value.quantity);
		return (((current - initial) / current) * 100).toFixed(2) + '%';
	});

	const labels = $derived(
		dataRange.slice(0, 20).map(({ date }) => String(date.toLocaleDateString()))
	);
	const values = $derived(dataRange.slice(0, 20).map(({ value }) => Number(value.quantity)));

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
		updateChart();
	});

	function handleSelectedChange({
		curr,
		next
	}: {
		curr: ExtendedSelectOption | undefined;
		next: ExtendedSelectOption | undefined;
	}): ExtendedSelectOption | undefined {
		if (next && (!curr || next.value !== curr.value)) {
			selectedRange = next;
			updateChart();
		}
		return next;
	}

	function updateChart() {
		if (data.length === 0) return;

		const rangeEndDate = dayjs(data[0].date);
		const rangeStartDate = rangeEndDate.subtract(Number(selectedRange.value), 'day');
		const filteredData = data.filter(({ date }) => dayjs(date).isAfter(rangeStartDate));

		// If we have more points than we want to display, sample them
		if (filteredData.length > POINTS_TO_DISPLAY) {
			const step = Math.floor(filteredData.length / POINTS_TO_DISPLAY);
			dataRange = filteredData.filter((_, index) => index % step === 0).slice(0, POINTS_TO_DISPLAY);
		} else {
			dataRange = filteredData;
		}

		console.log({ labels, values });
		if (chart && labels && values) {
			chart.data.labels = labels;
			chart.data.datasets[0].data = values;
		}
	}

	$effect(() => {
		if (chart?.data?.datasets[0]?.data) {
			chart.update();
		}
	});
</script>

<Card>
	<header class="flex justify-between">
		<Stack class="gap-0">
			<p class="h4 font-semibold text-white/50">RAM Price - EOS</p>
			<p class="h3 font-semibold">{currentPrice}</p>
			<p class="h4 font-semibold text-white/50">{percentChange}</p>
		</Stack>
		<Select
			id="range-select"
			options={range}
			bind:selected={selectedRange}
			onSelectedChange={handleSelectedChange}
		/>
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
