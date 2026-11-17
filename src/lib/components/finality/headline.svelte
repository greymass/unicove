<script lang="ts">
	import { getContext } from 'svelte';
	import type { UnicoveContext } from '$lib/state/client.svelte';
	import type { MinutePoint, StageStatus } from '$lib/state/finality/derive';
	import { baselineCovered } from '$lib/state/finality/markers';
	import type { BaselineMessage } from '$lib/state/finality/v1';
	import { formatNumber } from '$lib/utils/intl';
	import { coverageLabel, formatClock, formatMs } from './labels.svelte';
	import Sparkline from './sparkline.svelte';
	import Status from './status.svelte';

	interface Props {
		value: number | null;
		status: StageStatus;
		baseline: BaselineMessage | null;
		points: MinutePoint[];
		asOf: number | null;
	}

	const { value, status, baseline, points, asOf }: Props = $props();

	const context = getContext<UnicoveContext>('state');
	const locale = $derived(context.settings.data.locale);
	const covered = $derived(baselineCovered(baseline) ? baseline : null);
	const seconds = $derived(
		value === null
			? '–'
			: formatNumber(value / 1000, locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
	);
</script>

<div class="grid gap-3" class:opacity-60={asOf !== null}>
	<div>
		<p class="text-6xl leading-none font-semibold tracking-tight tabular-nums">
			{seconds}{#if value !== null}<span class="text-on-surface-variant ml-1 text-2xl font-medium"
					>s</span
				>{/if}
		</p>
		<p class="text-muted mt-2 text-sm">
			{#if asOf !== null}
				Time to final as of {formatClock(asOf)} UTC
			{:else}
				Time to final, median of the last 20 final blocks
			{/if}
		</p>
	</div>
	<div class="flex flex-wrap items-center gap-x-3 gap-y-1">
		{#if covered && covered.time_to_final_p50 !== null && covered.time_to_final_p99 !== null}
			<Status {status} />
			<span class="text-muted text-sm">
				Baseline p50 {formatMs(covered.time_to_final_p50, locale)} · p99 {formatMs(
					covered.time_to_final_p99,
					locale
				)} · {coverageLabel(covered.minutes, locale)}
			</span>
		{:else if status === 'no_data'}
			<Status {status} />
		{:else}
			<Status status="building" label={coverageLabel(baseline?.minutes ?? 0, locale)} />
		{/if}
	</div>
	<div>
		<Sparkline {points} p99={covered?.time_to_final_p99 ?? null} />
		<p class="text-muted mt-1 text-xs">Time to final p90 per minute, last 15 min</p>
	</div>
</div>
