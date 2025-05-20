<script lang="ts">
	import dayjs from 'dayjs';
	import Card from '../layout/box/card.svelte';
	import Select from '../select/select.svelte';
	import type { ExtendedSelectOption } from '../select/types';
	import type { HistoricalPrice } from '$lib/types';
	import LineChart from './line-chart.svelte';
	import * as m from '$lib/paraglide/messages';

	interface Props {
		pair: string;
		data: HistoricalPrice[];
		type: 'line';
	}

	let { pair, data, ...props }: Props = $props();

	const range: ExtendedSelectOption[] = [
		{ label: '1d', value: 1 },
		{ label: '1w', value: 7 },
		{ label: '1mo', value: 30 }
		// { label: '1Y', value: 365 } // We're currently only getting data for the last 30 days
	];

	let selectedRange: ExtendedSelectOption = $state(range[1]);

	const MAX_NUM_POINTS = 100; // Maximum number of points to display on the chart

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

	let startDate = $derived(dataRange[dataRange.length - 1].date.toLocaleDateString());

	let currentPoint = $derived(dataRange[0]);
	let currentPrice = $derived(String(currentPoint.value));

	let percentChange = $derived.by(() => {
		const current = Number(currentPoint.value.quantity);
		const initial = Number(dataRange[dataRange.length - 1].value.quantity);
		return (((current - initial) / current) * 100).toFixed(2) + '%';
	});
</script>

<Card class="relative [contain:paint]">
	<header class="flex justify-between">
		<div>
			<p class="text-muted">{pair}</p>
			<p class="text-on-surface text-xl font-semibold">{currentPrice}</p>
			<p class="text-muted">{percentChange}</p>
		</div>
		<Select id="range-select" options={range} bind:selected={selectedRange} />
	</header>

	<!-- w-99 is a hack to get responsive charts, w-full doesn't work -->
	<div class="canvas-container relative h-auto w-[99%]">
		{#if props.type === 'line'}
			<LineChart label={pair} data={dataRange} />
		{/if}
	</div>

	<hr class="bg-outline h-px border-0" />

	<div class="flex items-center justify-between font-medium">
		<span class="text-muted">{startDate}</span>
		<div class="flex gap-4">
			<div class="flex items-center gap-1">
				<div class="size-4 rounded-sm bg-[#00ED97]"></div>
				<span class="text-[#00ED97]">{pair}</span>
			</div>
		</div>
		<span class="text-muted">{m.common_today()}</span>
	</div>
</Card>
