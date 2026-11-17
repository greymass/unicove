<script lang="ts">
	import { getContext } from 'svelte';
	import { Table, TD, TH, TR } from '@wharfkit/svelte-components';
	import type { UnicoveContext } from '$lib/state/client.svelte';
	import type { ProducerStats } from '$lib/state/finality/derive';
	import { formatNumber } from '$lib/utils/intl';
	import { formatOver, formatShare, formatSignedMs } from './labels.svelte';

	interface Props {
		producers: ProducerStats[];
		ready: boolean;
		latencyP99: number | null;
	}

	const { producers, ready, latencyP99 }: Props = $props();

	const context = getContext<UnicoveContext>('state');
	const locale = $derived(context.settings.data.locale);
	const signed = (value: number | null) => (value === null ? '–' : formatSignedMs(value, locale));
</script>

<div class="grid gap-2">
	<div class="overflow-x-auto">
		<Table full class="overflow-visible">
			{#snippet thead()}
				<TH class="bg-surface sticky left-0 z-[1] pl-2">Producer</TH>
				<TH class="text-right">Blocks produced</TH>
				<TH class="text-right">Slots missed</TH>
				<TH class="text-right">Latency p50</TH>
				<TH class="text-right">Latency p90</TH>
				<TH class="text-right">QC-block votes over threshold</TH>
				<TH class="text-right">QCs at threshold</TH>
			{/snippet}
			{#if !ready}
				<TR><TD class="text-muted" colspan={7}>Waiting for the first blocks</TD></TR>
			{:else}
				{#each producers as row (row.producer)}
					<TR>
						<TD
							class="bg-surface sticky left-0 z-[1] font-mono whitespace-nowrap {row.marked
								? 'shadow-[inset_2px_0_0_var(--color-on-surface-variant)]'
								: ''} pl-2">{row.producer}</TD
						>
						<TD class="text-right tabular-nums">{formatNumber(row.blocks, locale)}</TD>
						<TD class="text-right tabular-nums">{formatNumber(row.missed, locale)}</TD>
						<TD class="text-right whitespace-nowrap tabular-nums">{signed(row.latencyP50)}</TD>
						<TD class="text-right whitespace-nowrap tabular-nums">{signed(row.latencyP90)}</TD>
						<TD class="text-right tabular-nums">{formatOver(row.votesOverP50, locale)}</TD>
						<TD class="text-right tabular-nums"
							>{formatShare(row.atThreshold, row.qcBlocks, locale)}</TD
						>
					</TR>
				{/each}
			{/if}
		</Table>
	</div>
	<p class="text-muted text-xs">
		{#if latencyP99 !== null}
			Schedule order, live window 2 min. A marked row has latency p90 above the baseline p99 ({signed(
				latencyP99
			)}).
		{:else}
			Schedule order, live window 2 min. Rows are marked once the baseline covers 60 min.
		{/if}
	</p>
</div>
