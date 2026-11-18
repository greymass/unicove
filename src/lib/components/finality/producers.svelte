<script lang="ts">
	import { getContext } from 'svelte';
	import { Table, TD, TH, TR } from '@wharfkit/svelte-components';
	import type { UnicoveContext } from '$lib/state/client.svelte';
	import type { ProducerStats } from '$lib/state/finality/derive';
	import { flaggedFirst } from '$lib/state/finality/markers';
	import { formatNumber } from '$lib/utils/intl';
	import ExplorerLink from './explorerlink.svelte';
	import { formatOver, formatShare, formatSignedMs } from './labels.svelte';
	import { rowCell } from './marks';

	interface Props {
		producers: ProducerStats[];
		ready: boolean;
		latencyP99: number | null;
	}

	const { producers, ready, latencyP99 }: Props = $props();

	const context = getContext<UnicoveContext>('state');
	const locale = $derived(context.settings.data.locale);
	const rows = $derived(flaggedFirst(producers, (row) => row.marked));
	const signed = (value: number | null) => (value === null ? '–' : formatSignedMs(value, locale));
</script>

<div class="grid gap-2">
	<div class="overflow-x-auto">
		<Table full class="overflow-visible">
			{#snippet thead()}
				<TH class="bg-surface sticky left-0 z-[1] pl-2">Producer</TH>
				<TH class="text-right">Latency max</TH>
				<TH class="text-right">Latency p50</TH>
				<TH class="text-right">QC-block votes over threshold</TH>
				<TH class="text-right">QCs at threshold</TH>
				<TH class="text-right">Slots missed</TH>
				<TH class="text-right">Blocks produced</TH>
			{/snippet}
			{#if !ready}
				<TR><TD class="text-muted" colspan={7}>Waiting for the first blocks</TD></TR>
			{:else}
				{#each rows as row (row.producer)}
					{@const tint = rowCell(row.marked)}
					<TR>
						<TD class="sticky left-0 z-[1] font-mono whitespace-nowrap {tint || 'bg-surface'} pl-2"
							><ExplorerLink account={row.producer} /></TD
						>
						<TD
							class="text-right whitespace-nowrap tabular-nums {tint} {row.marked
								? 'text-warning'
								: ''}">{signed(row.latencyMax)}</TD
						>
						<TD class="text-right whitespace-nowrap tabular-nums {tint}"
							>{signed(row.latencyP50)}</TD
						>
						<TD class="text-right tabular-nums {tint}">{formatOver(row.votesOverP50, locale)}</TD>
						<TD class="text-right tabular-nums {tint}"
							>{formatShare(row.atThreshold, row.qcBlocks, locale)}</TD
						>
						<TD class="text-right tabular-nums {tint}">{formatNumber(row.missed, locale)}</TD>
						<TD class="text-right tabular-nums {tint}">{formatNumber(row.blocks, locale)}</TD>
					</TR>
				{/each}
			{/if}
		</Table>
	</div>
	<p class="text-muted text-xs">
		{#if latencyP99 !== null}
			Marked rows first, then schedule order; live window 2 min. A marked row produced blocks in a
			run of 5 or more above the baseline latency p99 ({signed(latencyP99)}).
		{:else}
			Marked rows first, then schedule order; live window 2 min. Rows are marked once the baseline
			covers 60 min.
		{/if}
	</p>
</div>
