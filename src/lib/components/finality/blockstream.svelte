<script lang="ts">
	import { getContext, tick } from 'svelte';
	import { Table, TD, TH, TR } from '@wharfkit/svelte-components';
	import type { UnicoveContext } from '$lib/state/client.svelte';
	import { qcLag, type FinalRecord } from '$lib/state/finality/derive';
	import { missedSlots } from '$lib/state/finality/schedule';
	import type { FinalityState } from '$lib/state/finality/state';
	import type { BlockMessage } from '$lib/state/finality/v1';
	import { formatNumber } from '$lib/utils/intl';
	import ExplorerLink from './explorerlink.svelte';
	import { formatMs, formatSignedMs } from './labels.svelte';

	interface Props {
		current: FinalityState;
		records: ReadonlyMap<number, FinalRecord>;
		highlight: [number, number] | null;
	}

	const { current, records, highlight }: Props = $props();

	const context = getContext<UnicoveContext>('state');
	const locale = $derived(context.settings.data.locale);

	const ROWS = 30;

	let all = $state(false);
	let hovering = $state(false);
	let focused = $state(false);
	let frozen: BlockMessage[] | null = $state(null);
	let container: HTMLDivElement | undefined = $state();

	const live = $derived([...current.blocks].reverse());
	const paused = $derived(hovering || focused);
	const rows = $derived.by(() => {
		const list = frozen ?? live;
		return all || highlight ? list : list.slice(0, ROWS);
	});
	const gaps = $derived.by(() => {
		const byBlock = new Map<number, { owner: string | null; count: number }[]>();
		for (const slot of missedSlots(current.blocks, current.schedules)) {
			const list = byBlock.get(slot.before) ?? [];
			const last = list[list.length - 1];
			if (last && last.owner === slot.owner) last.count++;
			else list.push({ owner: slot.owner, count: 1 });
			byBlock.set(slot.before, list);
		}
		return byBlock;
	});
	const newer = $derived(
		frozen && frozen[0] ? live.filter((block) => block.block_num > frozen![0].block_num).length : 0
	);

	$effect(() => {
		if (paused && !frozen) frozen = live;
		if (!paused) frozen = null;
	});

	$effect(() => {
		if (!highlight || !container) return;
		const from = highlight[0];
		tick().then(() => {
			container
				?.querySelector(`[data-block="${from}"]`)
				?.scrollIntoView({ block: 'center', behavior: 'smooth' });
		});
	});

	function resume() {
		frozen = live;
	}

	function missing(block: BlockMessage): { count: number; names: string[] } | null {
		const qc = block.qc;
		if (!qc) return null;
		const policy = current.policies.get(qc.generation);
		const indexes = qc.missing ?? [];
		return {
			count: indexes.length,
			names: indexes.map((index) => policy?.finalizers[index]?.description ?? `#${index}`)
		};
	}

	function inRun(block: BlockMessage): boolean {
		return !!highlight && block.block_num >= highlight[0] && block.block_num <= highlight[1];
	}

	function showAll(count: number): string {
		const n = formatNumber(count, locale);
		// @wc-include
		return `Show all ${n} in the live window`;
	}

	function missedLabel(count: number): string {
		const n = formatNumber(count, locale);
		// @wc-include
		return count === 1 ? 'missed slot' : `${n} missed slots`;
	}

	function newBlocks(count: number): string {
		const n = formatNumber(count, locale);
		// @wc-include
		return count === 1 ? `${n} new block` : `${n} new blocks`;
	}
</script>

<div class="grid gap-2">
	<div class="flex min-h-8 items-center justify-between gap-2">
		<p class="text-muted text-sm">
			Newest first. The list holds still while the pointer is over it.
		</p>
		{#if frozen && newer}
			<button class="text-primary cursor-pointer text-sm" onclick={resume}
				>{newBlocks(newer)}</button
			>
		{/if}
	</div>
	<div
		class="overflow-x-auto"
		bind:this={container}
		role="region"
		aria-label="Blocks"
		onpointerenter={(event) => {
			if (event.pointerType === 'mouse') hovering = true;
		}}
		onpointerleave={() => (hovering = false)}
		onfocusin={() => (focused = true)}
		onfocusout={() => (focused = false)}
	>
		<Table full class="border-separate border-spacing-0 overflow-visible">
			{#snippet thead()}
				<TH class="bg-surface sticky left-0 z-[1]">block_num</TH>
				<TH class="text-right">time to final</TH>
				<TH class="text-right">latency</TH>
				<TH>producer</TH>
				<TH>qc</TH>
				<TH class="text-right">QC lag</TH>
				<TH>missing_votes</TH>
				<TH>final by</TH>
				<TH class="text-right">Production / QC / Latency</TH>
			{/snippet}
			{#if !current.ready}
				<TR><TD class="text-muted" colspan={9}>Waiting for the first blocks</TD></TR>
			{:else}
				{#each rows as block (block.block_num)}
					{@const record = records.get(block.block_num)}
					{@const absent = missing(block)}
					<tr
						data-block={block.block_num}
						tabindex="-1"
						class="[&>td]:border-outline-variant font-mono text-sm whitespace-nowrap [&>td]:border-b {inRun(
							block
						)
							? 'bg-[color-mix(in_oklab,var(--color-primary)_14%,var(--color-surface))]'
							: ''}"
					>
						<td
							class="sticky left-0 z-[1] py-1.5 pr-3 pl-2 {inRun(block)
								? 'bg-[color-mix(in_oklab,var(--color-primary)_14%,var(--color-surface))]'
								: 'bg-surface'}"><ExplorerLink block={block.block_num} /></td
						>
						<td class="px-3 py-1.5 text-right tabular-nums">
							{#if block.no_timing || record?.ms === null}<span class="text-muted font-sans"
									>no timing</span
								>{:else if record?.ms !== undefined}{formatMs(record.ms, locale)}{:else}–{/if}
						</td>
						<td class="px-3 py-1.5 text-right tabular-nums">
							{#if block.no_timing}<span class="text-muted font-sans">no timing</span
								>{:else}{formatSignedMs(block.latency, locale)}{/if}
						</td>
						<td class="px-3 py-1.5"><ExplorerLink account={block.producer} /></td>
						<td class="px-3 py-1.5">
							{#if block.qc}<ExplorerLink block={block.qc.block_num} />
								{block.qc.is_strong_qc ? 'strong' : 'weak'}{:else}<span class="text-muted font-sans"
									>none</span
								>{/if}
						</td>
						<td class="px-3 py-1.5 text-right tabular-nums">{block.qc ? qcLag(block) : '–'}</td>
						<td class="px-3 py-1.5" title={absent?.names.join(', ')}>
							{#if !absent}–{:else if absent.count}{absent.count}:
								{#each absent.names.slice(0, 2) as name, index (index)}{index
										? ', '
										: ''}<ExplorerLink account={name} />{/each}{absent.count > 2
									? '…'
									: ''}{:else}0{/if}
						</td>
						<td class="px-3 py-1.5">
							{#if record}<ExplorerLink block={record.by} />{:else}<span
									class="text-muted font-sans">pending</span
								>{/if}
						</td>
						<td class="text-muted px-3 py-1.5 text-right tabular-nums">
							{#if record?.split}{formatMs(record.split.production, locale)} / {formatMs(
									record.split.qc,
									locale
								)} / {formatSignedMs(record.split.latency, locale)}{/if}
						</td>
					</tr>
					{#each gaps.get(block.block_num) ?? [] as gap, index (index)}
						<tr class="[&>td]:border-outline-variant text-sm whitespace-nowrap [&>td]:border-b">
							<td
								colspan={9}
								class="bg-surface-container text-on-surface-variant sticky left-0 py-1 pr-3 pl-2"
							>
								{missedLabel(gap.count)}{#if gap.owner}<span class="px-1.5" aria-hidden="true"
										>·</span
									><ExplorerLink account={gap.owner} class="font-mono" />{/if}
							</td>
						</tr>
					{/each}
				{/each}
			{/if}
		</Table>
	</div>
	{#if current.ready && !all && !highlight && live.length > ROWS}
		<button
			class="text-primary cursor-pointer justify-self-start text-sm"
			onclick={() => (all = true)}
		>
			{showAll(live.length)}
		</button>
	{/if}
</div>
