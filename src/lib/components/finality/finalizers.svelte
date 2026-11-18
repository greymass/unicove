<script lang="ts">
	import { getContext } from 'svelte';
	import { Table, TD, TH, TR } from '@wharfkit/svelte-components';
	import type { UnicoveContext } from '$lib/state/client.svelte';
	import type { FinalizerStats } from '$lib/state/finality/derive';
	import { finalizerChronic, flaggedFirst } from '$lib/state/finality/markers';
	import type { BaselineFinalizer } from '$lib/state/finality/v1';
	import { formatNumber } from '$lib/utils/intl';
	import ExplorerLink from './explorerlink.svelte';
	import { formatShare } from './labels.svelte';
	import { CHRONIC_CELL, rowCell } from './marks';

	interface Props {
		finalizers: FinalizerStats[];
		baseline: readonly BaselineFinalizer[];
		generation: number | null;
		ready: boolean;
	}

	const { finalizers, baseline, generation, ready }: Props = $props();

	const context = getContext<UnicoveContext>('state');
	const locale = $derived(context.settings.data.locale);
	const rates = $derived(new Map(baseline.map((entry) => [entry.public_key, entry])));
	const chronic = (key: string) => finalizerChronic(rates.get(key));
	const rows = $derived(flaggedFirst(finalizers, (row) => row.marked || chronic(row.public_key)));
	const showWeak = $derived(finalizers.some((row) => row.weak > 0));
	const columns = $derived(showWeak ? 6 : 5);

	function baselineShare(key: string): string {
		const entry = rates.get(key);
		if (!entry || !entry.qcs) return '–';
		return formatShare(entry.missing, entry.qcs, locale);
	}
</script>

<div class="grid gap-2">
	<div class="overflow-x-auto">
		<Table full class="overflow-visible">
			{#snippet thead()}
				<TH class="bg-surface sticky left-0 z-[1] pl-2">Finalizer</TH>
				<TH class="text-right">Missing votes</TH>
				<TH class="text-right">Baseline</TH>
				{#if showWeak}<TH class="text-right">Weak votes</TH>{/if}
				<TH class="text-right">Last vote</TH>
				<TH class="text-right">Behind head</TH>
			{/snippet}
			{#if !ready}
				<TR><TD class="text-muted" colspan={columns}>Waiting for the first blocks</TD></TR>
			{:else}
				{#each rows as row (row.public_key)}
					{@const tint = rowCell(row.marked)}
					<TR>
						<TD class="sticky left-0 z-[1] whitespace-nowrap {tint || 'bg-surface'} pl-2">
							<span title={row.public_key}
								><ExplorerLink account={row.description} class="font-mono" /></span
							>
							{#if row.pending}<span class="text-muted ml-1 text-xs">pending</span>{/if}
						</TD>
						<TD class="text-right tabular-nums {tint}"
							>{formatShare(row.missing, row.qcs, locale)}</TD
						>
						<TD
							class="text-right tabular-nums {chronic(row.public_key)
								? CHRONIC_CELL
								: `text-muted ${tint}`}">{baselineShare(row.public_key)}</TD
						>
						{#if showWeak}
							<TD class="text-right tabular-nums {tint}"
								>{formatShare(row.weak, row.qcs, locale)}</TD
							>
						{/if}
						<TD class="text-right font-mono tabular-nums {tint}">
							{#if row.lastVote === null}–{:else}<ExplorerLink block={row.lastVote} />{/if}
						</TD>
						<TD class="text-right tabular-nums {tint}">
							{row.behind === null ? '–' : formatNumber(row.behind, locale)}
						</TD>
					</TR>
				{/each}
			{/if}
		</Table>
	</div>
	<p class="text-muted text-xs">
		Marked rows first, then finalizer policy order{#if generation !== null}, generation {generation}{/if}.
		Missing votes is the share of QCs in the live window without this finalizer's vote. A marked row
		is missing more votes than its own baseline rate makes likely; a marked baseline misses 5% or
		more over 24 h.
	</p>
</div>
