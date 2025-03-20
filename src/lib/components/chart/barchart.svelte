<script lang="ts">
	import { onMount } from 'svelte';
	import { Chart } from 'chart.js';
	import 'chart.js/auto';
	import { Card } from '$lib/components/layout';
	import * as m from '$lib/paraglide/messages';

	interface Props {
		data: { x: number; y: number; y1?: number }[];
		title: string;
	}

	let { data, title }: Props = $props();

	let ctx: HTMLCanvasElement;

	onMount(() => {
		new Chart(ctx, {
			type: 'bar',
			data: {
				labels: data.map((_, i) => i + 1),
				datasets: [
					{
						label: 'Staked',
						data: data.map((d) => d.y),
						backgroundColor: '#00ED97',
						borderRadius: 4
					},
					{
						label: 'Yield',
						data: data.map((d) => d.y1),
						backgroundColor: '#B2FAE0',
						borderRadius: 4
					}
				]
			},
			options: {
				responsive: true,
				scales: {
					x: {
						stacked: true,
						grid: {
							display: false
						},
						ticks: {
							display: false
						}
					},
					y: {
						stacked: true,
						grid: {
							display: false
						},
						ticks: {
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
</script>

<Card>
	<p class="h3 font-semibold">{title}</p>
	<canvas bind:this={ctx}></canvas>
	<hr class="bg-shark-200/50 h-px border-0" />
	<div class="flex items-center justify-between font-medium">
		<!-- <span class="text-shark-200/70">{String(data.length)} days</span> -->
		<div class="flex gap-4">
			<div class="flex items-center gap-1">
				<div class="size-4 rounded-sm bg-[#00ED97]"></div>
				<span class="text-[#00ED97]">{m.common_staked()}</span>
			</div>
			<div class="flex items-center gap-1">
				<div class="size-4 rounded-sm bg-[#B2FAE0]"></div>
				<span class="text-[#B2FAE0]">{m.common_yield()}</span>
			</div>
		</div>
		<span class="text-shark-200/70">{m.common_today()}</span>
	</div>
</Card>
