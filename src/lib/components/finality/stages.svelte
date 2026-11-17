<script lang="ts">
	import { getContext } from 'svelte';
	import { page } from '$app/state';
	import type { UnicoveContext } from '$lib/state/client.svelte';
	import type { ChainStage, StageReading } from '$lib/state/finality/derive';
	import { formatNumber } from '$lib/utils/intl';
	import { formatMs, formatOver, formatSignedMs, stageLabel } from './labels.svelte';
	import Status from './status.svelte';

	interface Props {
		readings: StageReading[];
		empty: boolean;
		dim?: boolean;
	}

	const { readings, empty, dim = false }: Props = $props();

	const context = getContext<UnicoveContext>('state');
	const locale = $derived(context.settings.data.locale);

	const TARGETS: Record<ChainStage, { view: string; hash?: string }> = {
		production: { view: 'producers' },
		latency: { view: 'producers' },
		votes: { view: 'producers', hash: 'finalizers' },
		qc: { view: 'blocks' },
		final: { view: 'blocks' }
	};

	function href(stage: ChainStage): string {
		const target = TARGETS[stage];
		const url = new URL(page.url);
		url.searchParams.set('view', target.view);
		url.searchParams.delete('at');
		url.hash = target.hash ?? '';
		return `${url.pathname}${url.search}${url.hash}`;
	}

	function figure(reading: StageReading): string {
		const value = reading.figure;
		if (value === null || empty) return '–';
		const count = formatNumber(value, locale);
		if (reading.stage === 'production') {
			// @wc-include
			const slots = value === 1 ? `${count} missed slot` : `${count} missed slots`;
			if (!reading.forks) return slots;
			const forks = formatNumber(reading.forks, locale);
			// @wc-include
			return reading.forks === 1 ? `${slots}, ${forks} fork` : `${slots}, ${forks} forks`;
		}
		if (reading.stage === 'latency') {
			const latency = formatSignedMs(value, locale);
			// @wc-include
			return `p50 ${latency}`;
		}
		if (reading.stage === 'votes') {
			const over = formatOver(value, locale);
			// @wc-include
			return `lowest ${over} over threshold`;
		}
		if (reading.stage === 'qc') {
			// @wc-include
			return value === 1 ? `${count} exception` : `${count} exceptions`;
		}
		const final = formatMs(value, locale);
		// @wc-include
		return `p90 ${final}`;
	}
</script>

<ol class="grid gap-0.5 overflow-hidden rounded-xl min-[860px]:grid-cols-5">
	{#each readings as reading (reading.stage)}
		<li>
			<a
				href={href(reading.stage)}
				data-sveltekit-noscroll
				data-sveltekit-replacestate
				class="bg-surface hover:bg-surface-container-low grid h-full gap-1 px-4 py-3 max-[859px]:grid-cols-[6rem_1fr_auto] max-[859px]:items-center"
			>
				<span class="text-muted text-xs font-medium tracking-wider uppercase">
					{stageLabel(reading.stage)}
				</span>
				<span class="text-base font-semibold tabular-nums xl:text-lg" class:opacity-60={dim}>
					{figure(reading)}
				</span>
				<Status status={reading.status} />
			</a>
		</li>
	{/each}
</ol>
