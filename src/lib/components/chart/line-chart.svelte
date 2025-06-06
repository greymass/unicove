<script lang="ts">
	import { onMount } from 'svelte';
	import { Chart } from 'chart.js';
	import 'chart.js/auto';
	import type { HistoricalPrice } from '$lib/types';

	let ctx: HTMLCanvasElement;
	let chart: Chart<'line'>;

	interface Props {
		data: HistoricalPrice[];
		label: string;
		color: string;
	}

	let { data, label, color }: Props = $props();

	const labels = $derived(data.map(({ date }) => String(date.toLocaleDateString())));
	const values = $derived(data.map(({ value }) => Number(value.quantity)));

	const tickColor = $derived(
		getComputedStyle(document.documentElement).getPropertyValue('--color-on-surface-variant').trim()
	);

	onMount(() => {
		chart = new Chart(ctx, {
			type: 'line',
			data: {
				labels: labels,
				datasets: [
					{
						label: label,
						data: values,
						fill: false,
						pointBackgroundColor: 'transparent',
						pointBorderColor: color,
						borderColor: color,
						pointBorderWidth: 0
					}
				]
			},
			options: {
				normalized: true,
				responsive: true,
				maintainAspectRatio: false,
				interaction: {
					mode: 'nearest',
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
						},
						ticks: {
							color: tickColor
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
		chart.data.datasets[0].borderColor = color;
		chart.data.datasets[0].pointBorderColor = color;
		chart.update();
	});
</script>

<canvas bind:this={ctx}></canvas>
