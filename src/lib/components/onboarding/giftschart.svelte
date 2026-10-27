<script lang="ts">
	import { getContext, onMount } from 'svelte';
	import { Chart } from 'chart.js';
	import 'chart.js/auto';
	import type { UnicoveContext } from '$lib/state/client.svelte';
	import type { ProgramDay } from '$lib/state/creationindex/client';
	import { DAY_MS, isoDay } from '$lib/state/creationindex/onboarding';
	import { formatBytes } from '$lib/utils/bytes';
	import { formatDateTime } from '$lib/utils/intl';

	interface Props {
		daily: ProgramDay[];
		now: number;
		days?: number;
		creator?: string;
		height?: string;
	}

	let { daily, now, days = 30, creator, height = '16rem' }: Props = $props();

	const context = getContext<UnicoveContext>('state');
	const locale = $derived(context.settings.data.locale);

	const PALETTE = [
		'oklch(0.62 0.18 320)',
		'oklch(0.62 0.15 250)',
		'oklch(0.68 0.14 160)',
		'oklch(0.75 0.14 75)',
		'oklch(0.6 0.16 25)',
		'oklch(0.65 0.12 200)'
	];

	let canvas: HTMLCanvasElement;
	let chart: Chart<'bar'> | undefined;

	function cssColor(name: string): string {
		return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
	}

	function chartData() {
		const keys = Array.from({ length: days }, (_, i) => isoDay(now - (days - 1 - i) * DAY_MS));
		const byDay = new Map(daily.map((d) => [d.day, d]));
		const creators = [
			...new Set(daily.flatMap((d) => d.program_creators.map((c) => c.program_creator)))
		].filter((c) => creator === undefined || c === creator);
		return {
			labels: keys.map((key) =>
				formatDateTime(new Date(`${key}T00:00:00Z`), locale, {
					dateStyle: undefined,
					timeStyle: undefined,
					month: 'short',
					day: 'numeric',
					timeZone: 'UTC'
				})
			),
			datasets: creators.map((c, i) => ({
				label: c || 'No creator',
				data: keys.map(
					(key) => byDay.get(key)?.program_creators.find((p) => p.program_creator === c)?.bytes ?? 0
				),
				backgroundColor: PALETTE[i % PALETTE.length],
				borderWidth: 0,
				stack: 'gifts'
			}))
		};
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
					legend: {
						display: creator === undefined,
						position: 'bottom',
						labels: { boxWidth: 10, color: muted }
					},
					tooltip: {
						callbacks: {
							label: (item) => `${item.dataset.label}: ${formatBytes(Number(item.raw))}`
						}
					}
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
						ticks: { color: muted, callback: (value) => formatBytes(Number(value)) }
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
	<canvas bind:this={canvas} aria-label="Bytes gifted per day by creator"></canvas>
</figure>
