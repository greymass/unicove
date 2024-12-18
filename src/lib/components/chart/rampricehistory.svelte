<script lang="ts">
	import { onMount } from 'svelte';
	import dayjs from 'dayjs';
	import { Chart } from 'chart.js';
	import 'chart.js/auto';
	import { Asset } from '@wharfkit/antelope';
	import type { ExtendedSelectOption } from '../select/types';
	import ChartContainer from './chart-container.svelte';

	interface Props {
		data: { date: Date; value: Asset }[];
	}

	let { data }: Props = $props();

	let ctx: HTMLCanvasElement;
	let chart: Chart<'line'>;

	const range: ExtendedSelectOption[] = [
		{ label: '1D', value: 1 },
		{ label: '1W', value: 7 },
		{ label: '1M', value: 30 }
		// { label: '1Y', value: 365 } // We're currently only getting data for the last 30 days
	];

	const MAX_NUM_POINTS = 100; // Maximum number of points to display on the chart

	let selectedRange: ExtendedSelectOption = $state(range[1]);

	let dataRange = $derived.by(() => {
		if (data.length === 0) return [];
		const rangeEndDate = dayjs(data[0].date);
		const rangeStartDate = rangeEndDate.subtract(Number(selectedRange.value), 'day');
		const filteredData = data.filter(({ date }) => dayjs(date).isAfter(rangeStartDate));

		// If we have more points than MAX_NUM_POINTS, sample them evenly
		if (filteredData.length > MAX_NUM_POINTS) {
			const result = [];
			const step = filteredData.length / MAX_NUM_POINTS;
			for (let i = 0; i < MAX_NUM_POINTS; i++) {
				const index = Math.floor(i * step);
				result.push(filteredData[index]);
			}
			return result;
		}

		return filteredData;
	});

	let currentPoint = $derived(dataRange[0]);
	let currentPrice = $derived(String(currentPoint.value));

	let percentChange = $derived.by(() => {
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
						label: 'EOS/RAM',
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
				maintainAspectRatio: false,
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

	let startDate = $derived(dataRange[dataRange.length - 1].date.toLocaleDateString());
</script>

<ChartContainer
	pair="EOS/RAM"
	{currentPrice}
	{percentChange}
	{startDate}
	{range}
	bind:selectedRange
>
	<canvas bind:this={ctx}></canvas>
</ChartContainer>
