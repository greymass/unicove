<script lang="ts">
	import { getContext } from 'svelte';
	import type { UnicoveContext } from '$lib/state/client.svelte';
	import { qcVotes, type FinalRecord } from '$lib/state/finality/derive';
	import { baselineCovered } from '$lib/state/finality/markers';
	import { LIVE_WINDOW_MS, type FinalityState } from '$lib/state/finality/state';
	import type { BlockMessage, Qc } from '$lib/state/finality/v1';
	import { formatNumber } from '$lib/utils/intl';
	import { formatClock, formatMs, formatOver, formatSignedMs } from './labels.svelte';

	interface Props {
		current: FinalityState;
		records: ReadonlyMap<number, FinalRecord>;
		qcOn: ReadonlyMap<number, Qc>;
	}

	const { current, records, qcOn }: Props = $props();

	const context = getContext<UnicoveContext>('state');
	const locale = $derived(context.settings.data.locale);

	const HEIGHT = 200;
	const PAD_LEFT = 44;
	const PAD_RIGHT = 6;
	const PAD_TOP = 8;
	const PAD_BOTTOM = 20;

	let width = $state(600);
	let hovered: { block: BlockMessage; x: number; y: number } | null = $state(null);

	const covered = $derived(baselineCovered(current.baseline));
	const p50 = $derived(covered ? current.baseline!.time_to_final_p50 : null);
	const p99 = $derived(covered ? current.baseline!.time_to_final_p99 : null);
	const end = $derived(current.blocks[current.blocks.length - 1]?.timestamp ?? 0);
	const start = $derived(end - LIVE_WINDOW_MS);

	const yMax = $derived.by(() => {
		let max = 2000;
		for (const record of records.values()) if (record.ms !== null) max = Math.max(max, record.ms);
		if (p99 !== null) max = Math.max(max, p99 * 1.1);
		return Math.ceil(max / 500) * 500;
	});

	const x = (t: number) =>
		PAD_LEFT + ((t - start) / LIVE_WINDOW_MS) * (width - PAD_LEFT - PAD_RIGHT);
	const y = (v: number) => PAD_TOP + (1 - v / yMax) * (HEIGHT - PAD_TOP - PAD_BOTTOM);

	const yTicks = $derived.by(() => {
		const step = yMax <= 3000 ? 500 : yMax <= 6000 ? 1000 : 2000;
		const ticks: number[] = [];
		for (let v = 0; v <= yMax; v += step) ticks.push(v);
		return ticks;
	});

	const xTicks = $derived.by(() => {
		const count = width < 640 ? 2 : 4;
		return Array.from({ length: count + 1 }, (_, k) => start + (k / count) * LIVE_WINDOW_MS);
	});

	const series = $derived.by(() => {
		let path = '';
		let gap = true;
		let last: { x: number; y: number } | null = null;
		const pending: number[] = [];
		const untimed: number[] = [];
		for (const block of current.blocks) {
			if (block.no_timing) {
				untimed.push(block.timestamp);
				gap = true;
				continue;
			}
			const record = records.get(block.block_num);
			if (!record) {
				pending.push(block.timestamp);
				continue;
			}
			if (record.ms === null) {
				gap = true;
				continue;
			}
			const px = x(block.timestamp);
			const py = y(record.ms);
			// @wc-ignore
			path += `${gap ? 'M' : 'L'}${px.toFixed(1)},${py.toFixed(1)}`;
			gap = false;
			last = { x: px, y: py };
		}
		return { path, last, pending, untimed };
	});

	function secondsTick(v: number): string {
		if (!v) return '0';
		const value = formatNumber(v / 1000, locale, { maximumFractionDigits: 1 });
		// @wc-include
		return `${value} s`;
	}

	function nearest(t: number): BlockMessage | null {
		const blocks = current.blocks;
		if (!blocks.length) return null;
		let lo = 0;
		let hi = blocks.length - 1;
		while (lo < hi) {
			const mid = (lo + hi) >> 1;
			if (blocks[mid].timestamp < t) lo = mid + 1;
			else hi = mid;
		}
		const prev = blocks[lo - 1];
		return prev && t - prev.timestamp < blocks[lo].timestamp - t ? prev : blocks[lo];
	}

	function onpointermove(event: PointerEvent) {
		const svg = event.currentTarget as SVGSVGElement;
		const rect = svg.getBoundingClientRect();
		const px = event.clientX - rect.left;
		if (px < PAD_LEFT) {
			hovered = null;
			return;
		}
		const t = start + ((px - PAD_LEFT) / (width - PAD_LEFT - PAD_RIGHT)) * LIVE_WINDOW_MS;
		const block = nearest(t);
		hovered = block ? { block, x: px, y: event.clientY - rect.top } : null;
	}

	const tip = $derived.by(() => {
		if (!hovered) return null;
		const block = current.blockIndex.get(hovered.block.block_num) ?? hovered.block;
		const record = records.get(block.block_num) ?? null;
		const qc = qcOn.get(block.block_num);
		return { block, record, votes: qc ? qcVotes(qc, current.policies) : null };
	});
</script>

<figure class="relative w-full min-w-0" bind:clientWidth={width}>
	<svg
		viewBox="0 0 {width} {HEIGHT}"
		height={HEIGHT}
		class="block w-full touch-pan-y"
		role="img"
		aria-label="Time to final per block, last 2 min"
		{onpointermove}
		onpointerleave={() => (hovered = null)}
	>
		<defs>
			<pattern
				id="finality-hatch"
				width="4"
				height="4"
				patternUnits="userSpaceOnUse"
				patternTransform="rotate(45)"
			>
				<rect width="2" height="4" class="fill-outline" />
			</pattern>
		</defs>
		{#each yTicks as tick (tick)}
			<line x1={PAD_LEFT} x2={width} y1={y(tick)} y2={y(tick)} class="stroke-outline-variant" />
			<text x={PAD_LEFT - 6} y={y(tick) + 4} text-anchor="end" class="fill-muted text-[11px]">
				{secondsTick(tick)}
			</text>
		{/each}
		{#if p50 !== null && p99 !== null}
			<rect
				x={PAD_LEFT}
				y={y(p99)}
				width={Math.max(0, width - PAD_LEFT)}
				height={Math.max(0, y(p50) - y(p99))}
				class="fill-primary opacity-10"
			/>
			<line x1={PAD_LEFT} x2={width} y1={y(p99)} y2={y(p99)} class="stroke-primary opacity-50" />
			<text x={width - 4} y={y(p99) - 4} text-anchor="end" class="fill-muted text-[11px]">
				Baseline p99 {formatMs(p99, locale)}
			</text>
		{/if}
		{#each series.untimed as t (t)}
			{#if t >= start}
				<rect
					x={x(t) - 1}
					y={y(1000)}
					width={Math.max(2, x(t + 500) - x(t))}
					height={y(0) - y(1000)}
					fill="url(#finality-hatch)"
				/>
			{/if}
		{/each}
		<path
			d={series.path}
			fill="none"
			class="stroke-primary"
			stroke-width="2"
			stroke-linejoin="round"
			stroke-linecap="round"
		/>
		{#if series.last}
			<circle
				cx={series.last.x}
				cy={series.last.y}
				r="4.5"
				class="fill-primary stroke-surface"
				stroke-width="2"
			/>
		{/if}
		{#each series.pending as t (t)}
			<circle cx={x(t)} cy={y(0) - 4} r="2.5" fill="none" class="stroke-muted" />
		{/each}
		{#each current.blocks.length ? xTicks : [] as t, k (k)}
			<text
				x={x(t)}
				y={HEIGHT - 4}
				text-anchor={k === 0 ? 'start' : k === xTicks.length - 1 ? 'end' : 'middle'}
				class="fill-muted text-[11px]"
			>
				{formatClock(t)}
			</text>
		{/each}
		{#if hovered}
			<line
				x1={x(hovered.block.timestamp)}
				x2={x(hovered.block.timestamp)}
				y1={PAD_TOP}
				y2={HEIGHT - PAD_BOTTOM}
				class="stroke-on-surface-variant opacity-40"
			/>
		{/if}
	</svg>
	{#if hovered && tip}
		<div
			class="bg-surface-container-highest pointer-events-none absolute z-10 grid min-w-56 gap-0.5 rounded-lg px-3 py-2 text-xs whitespace-nowrap shadow-lg"
			style:left="{Math.min(Math.max(0, hovered.x + 12), width - 230)}px"
			style:top="{Math.min(hovered.y + 12, HEIGHT - 40)}px"
		>
			<div class="flex justify-between gap-4 font-mono">
				<b>#{tip.block.block_num}</b><span>{formatClock(tip.block.timestamp)}</span>
			</div>
			<div class="flex justify-between gap-4">
				<span class="text-muted">producer</span><span class="font-mono">{tip.block.producer}</span>
			</div>
			<div class="flex justify-between gap-4">
				<span class="text-muted">time to final</span>
				<span>
					{#if tip.block.no_timing}
						no timing
					{:else if !tip.record}
						pending
					{:else if tip.record.ms === null}
						no timing
					{:else}
						{formatMs(tip.record.ms, locale)}
					{/if}
				</span>
			</div>
			{#if tip.record?.split}
				<div class="flex justify-between gap-4">
					<span class="text-muted">Production</span><span
						>{formatMs(tip.record.split.production, locale)}</span
					>
				</div>
				<div class="flex justify-between gap-4">
					<span class="text-muted">QC</span><span>{formatMs(tip.record.split.qc, locale)}</span>
				</div>
				<div class="flex justify-between gap-4">
					<span class="text-muted">Latency, final by #{tip.record.by}</span><span
						>{formatSignedMs(tip.record.split.latency, locale)}</span
					>
				</div>
			{/if}
			<div class="flex justify-between gap-4">
				<span class="text-muted">votes</span>
				<span>
					{#if tip.votes}
						{tip.votes.votes} of {tip.votes.total} ({formatOver(tip.votes.over, locale)})
					{:else}
						no QC yet
					{/if}
				</span>
			</div>
		</div>
	{/if}
</figure>
