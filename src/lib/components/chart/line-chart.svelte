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
	}

	let { data, label }: Props = $props();

	const labels = $derived(data.map(({ date }) => String(date.toLocaleDateString())));
	const values = $derived(data.map(({ value }) => Number(value.quantity)));

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
</script>

<canvas bind:this={ctx}></canvas>
