<script lang="ts">
	import type { Snippet } from 'svelte';

	import Card from '../layout/box/card.svelte';
	import Select from '../select/select.svelte';
	import type { ExtendedSelectOption } from '../select/types';

	interface Props {
		pair: string;
		currentPrice: string;
		percentChange: string;
		range: ExtendedSelectOption[];
		selectedRange: ExtendedSelectOption;
		children: Snippet;
		startDate: string;
		endDate?: string;
	}

	let {
		pair,
		currentPrice,
		percentChange,
		range,
		selectedRange = $bindable(),
		children,
		startDate,
		endDate = 'Today'
	}: Props = $props();
</script>

<Card class="relative">
	<header class="flex justify-between">
		<div>
			<p class="text-muted">{pair}</p>
			<p class="text-xl font-semibold text-white">{currentPrice}</p>
			<p class="text-muted">{percentChange}</p>
		</div>
		<Select id="range-select" options={range} bind:selected={selectedRange} />
	</header>
	<!-- w-99 is a hack to get responsive charts, w-full doesn't work -->
	<div class="canvas-container relative h-auto w-[99%]">
		{@render children()}
	</div>
	<hr class="h-px border-0 bg-shark-200/50" />
	<div class="flex items-center justify-between font-medium">
		<span class="text-muted">{startDate}</span>
		<div class="flex gap-4">
			<div class="flex items-center gap-1">
				<div class="size-4 rounded bg-[#00ED97]"></div>
				<span class="text-[#00ED97]">{pair}</span>
			</div>
		</div>
		<span class="text-muted">{endDate}</span>
	</div>
</Card>
