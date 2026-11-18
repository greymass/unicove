<script lang="ts">
	import { getContext } from 'svelte';
	import type { UnicoveContext } from '$lib/state/client.svelte';
	import type { AccountRow } from '$lib/state/finality/derive';
	import type { BaselineFinalizer } from '$lib/state/finality/v1';
	import ExplorerLink from './explorerlink.svelte';
	import { formatOver, formatShare, formatSignedMs } from './labels.svelte';
	import { CHRONIC_CELL, MARKED_CELL } from './marks';

	interface Props {
		rows: AccountRow[];
		baseline: readonly BaselineFinalizer[];
		active: string | null;
		ready: boolean;
		latencyP99: number | null;
	}

	const { rows, baseline, active, ready, latencyP99 }: Props = $props();

	const context = getContext<UnicoveContext>('state');
	const locale = $derived(context.settings.data.locale);
	const rates = $derived(new Map(baseline.map((entry) => [entry.public_key, entry])));
	const signed = (value: number | null) => (value === null ? '–' : formatSignedMs(value, locale));

	function baselineShare(key: string): string {
		const entry = rates.get(key);
		if (!entry || !entry.qcs) return '–';
		return formatShare(entry.missing, entry.qcs, locale);
	}

	const th = 'text-muted px-2 py-2 text-right text-sm font-normal whitespace-nowrap';
	const group = `${th} border-outline-variant border-b text-center`;
	const td = 'px-2 py-2.5 text-right tabular-nums whitespace-nowrap';
</script>

<div class="grid gap-2">
	<div class="overflow-x-auto">
		<table class="w-full border-separate border-spacing-0 text-sm">
			<thead>
				<tr>
					<th
						rowspan="2"
						class="text-muted bg-surface sticky left-0 z-[1] px-2 py-2 text-left align-bottom text-sm font-normal"
						>Account</th
					>
					<th colspan="3" class={group}>Producing</th>
					<th colspan="2" class={group}>Missing votes</th>
					<th rowspan="2" class="{th} align-bottom">Behind head</th>
				</tr>
				<tr>
					<th class={th}>Latency p50 / max</th>
					<th class={th}>Votes over threshold</th>
					<th class={th}>Blocks</th>
					<th class={th}>2 min</th>
					<th class={th}>24 h</th>
				</tr>
			</thead>
			<tbody>
				{#if !ready}
					<tr><td class="text-muted px-2 py-2.5" colspan={7}>Waiting for the first blocks</td></tr>
				{:else}
					{#each rows as row (row.account)}
						{@const tint = row.marked ? MARKED_CELL : ''}
						{@const producing = row.account === active}
						<tr class="[&>td]:border-outline-variant [&>td]:border-b">
							<td
								class="sticky left-0 z-[1] py-2.5 pr-2 pl-2 font-mono whitespace-nowrap {tint ||
									'bg-surface'} {producing ? 'shadow-[inset_3px_0_0_var(--color-primary)]' : ''}"
							>
								<span class="inline-flex items-center gap-1.5">
									<ExplorerLink account={row.account} />
									{#if producing}<span
											class="bg-primary size-1.5 animate-pulse rounded-full"
											aria-hidden="true"
										></span>{/if}
								</span>
							</td>
							{#if row.producer}
								{@const producer = row.producer}
								<td class="{td} {tint}"
									>{signed(producer.latencyP50)} /
									<span class={producer.marked ? 'text-warning' : ''}
										>{signed(producer.latencyMax)}</span
									></td
								>
								<td class="{td} {tint}"
									>{formatOver(producer.votesOverP50, locale)}{#if producer.atThreshold}<span
											class="text-warning"
											>&nbsp;· {formatShare(producer.atThreshold, producer.qcBlocks, locale)} at threshold</span
										>{/if}</td
								>
								<td class="{td} {tint}"
									>{producer.blocks}{#if producer.missed}<span class="text-warning"
											>&nbsp;· {producer.missed} missed</span
										>{/if}</td
								>
							{:else}
								<td class="{td} {tint} text-muted" colspan={3}>not in schedule</td>
							{/if}
							{#if row.finalizer}
								{@const finalizer = row.finalizer}
								<td class="{td} {tint}"
									>{formatShare(finalizer.missing, finalizer.qcs, locale)}{#if finalizer.weak}<span
											class="text-warning"
											>&nbsp;· {formatShare(finalizer.weak, finalizer.qcs, locale)} weak</span
										>{/if}</td
								>
								<td class="{td} {row.chronic ? CHRONIC_CELL : `text-muted ${tint}`}"
									>{baselineShare(finalizer.public_key)}</td
								>
								<td class="{td} {tint}">
									{#if finalizer.lastVote === null || finalizer.behind === null}–{:else}<ExplorerLink
											block={finalizer.lastVote}
											label={String(finalizer.behind)}
											class={finalizer.behind > 2 ? 'text-warning!' : ''}
										/>{/if}
								</td>
							{:else}
								<td class="{td} {tint} text-muted" colspan={3}>not in policy</td>
							{/if}
						</tr>
					{/each}
				{/if}
			</tbody>
		</table>
	</div>
	<p class="text-muted text-xs">
		Flagged rows first, then schedule order. Producing covers each producer's blocks in the live
		window (2 min); missing votes covers QCs in the live window and over 24 h. A tinted row produced
		blocks in a run of 5 or more above the baseline latency p99{#if latencyP99 !== null}&nbsp;({signed(
				latencyP99
			)}){/if}, or is missing more votes than its own 24 h rate makes likely. An amber 24 h share is
		5% or more. Behind head counts the blocks from the finalizer's last vote seen in a QC to the
		head. The pulsing dot marks the producer whose slot it is.
	</p>
</div>
