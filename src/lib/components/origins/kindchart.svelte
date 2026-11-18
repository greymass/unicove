<script lang="ts">
	import { getContext, onMount } from 'svelte';
	import { Chart } from 'chart.js';
	import 'chart.js/auto';
	import type { UnicoveContext } from '$lib/state/client.svelte';
	import type { CreationDay } from '$lib/state/creationindex/client';
	import { KIND_COLORS, ORIGIN_KINDS, kindCount } from '$lib/state/creationindex/origins';
	import { formatDateTime } from '$lib/utils/intl';
	import { kindLabel } from './labels.svelte';

	interface Props {
		days: CreationDay[];
		monthly?: boolean;
		height?: string;
	}

	let { days, monthly = false, height = '18rem' }: Props = $props();

	const context = getContext<UnicoveContext>('state');
	const locale = $derived(context.settings.data.locale);

	let canvas: HTMLCanvasElement;
	let chart: Chart<'bar'> | undefined;

	function cssColor(name: string): string {
		return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
	}

	function chartData() {
		const labels = days.map((day) =>
			formatDateTime(new Date(`${day.day}T00:00:00Z`), locale, {
				dateStyle: undefined,
				timeStyle: undefined,
				month: 'short',
				day: monthly ? undefined : 'numeric',
				year: monthly ? 'numeric' : undefined,
				// @wc-ignore
				timeZone: 'UTC'
			})
		);
		const datasets = ORIGIN_KINDS.map((kind) => ({
			label: kindLabel(kind),
			data: days.map((day) => kindCount(day, kind)),
			backgroundColor: KIND_COLORS[kind],
			borderWidth: 0,
			stack: 'creations'
		})).filter((dataset) => dataset.data.some((value) => value > 0));
		return { labels, datasets };
	}

	onMount(() => {
		const muted = cssColor('--color-on-surface-variant');
		chart = new Chart(canvas, {
			type: 'bar',
			data: chartData(),
			options: {
				responsive: true,
				maintainAspectRatio: false,
				interaction: { mode: 'index', intersect: false },
				plugins: {
					legend: { position: 'bottom', labels: { boxWidth: 10, color: muted } }
				},
				scales: {
					x: {
						stacked: true,
						border: { display: false },
						grid: { display: false },
						ticks: { maxTicksLimit: 8, maxRotation: 0, color: muted }
					},
					y: {
						stacked: true,
						beginAtZero: true,
						border: { display: false },
						grid: { display: false },
						ticks: { color: muted }
					}
				}
			}
		});
		return () => chart?.destroy();
	});

	$effect(() => {
		const data = chartData();
		if (!chart) return;
		chart.data = data;
		chart.update();
	});
</script>

<figure style:height class="relative w-full">
	<canvas bind:this={canvas} aria-label="Accounts created by how RAM arrived"></canvas>
</figure>
