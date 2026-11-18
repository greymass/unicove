<script lang="ts">
	import { getContext } from 'svelte';
	import { page } from '$app/state';
	import type { UnicoveContext } from '$lib/state/client.svelte';
	import type { FinalityState } from '$lib/state/finality/state';
	import type { SpanMessage, Stage } from '$lib/state/finality/v1';
	import { formatNumber } from '$lib/utils/intl';
	import { formatClock, reasonLabel, stageLabel } from './labels.svelte';

	const { current, end }: { current: FinalityState; end: number } = $props();

	const context = getContext<UnicoveContext>('state');
	const locale = $derived(context.settings.data.locale);

	const LANES: Stage[] = ['production', 'latency', 'votes', 'qc', 'final', 'feed'];
	const LANE_HEIGHT = 20;
	const PAD_LEFT = 84;
	const HEIGHT = LANES.length * LANE_HEIGHT + 22;

	let hours = $state<1 | 24>(1);
	let width = $state(600);
	let hovered: { span: SpanMessage; x: number; y: number } | null = $state(null);

	const range = $derived(hours * 60 * 60 * 1000);
	const ticks = $derived(width < 640 ? 3 : 6);
	const start = $derived(end - range);
	const oldest = $derived(current.blocks[0]?.block_num ?? Infinity);
	const x = (t: number) => PAD_LEFT + ((t - start) / range) * (width - PAD_LEFT - 4);

	const lanes = $derived.by(() => {
		const byLane = new Map<Stage, SpanMessage[]>(LANES.map((lane) => [lane, []]));
		for (const span of current.spans.values()) {
			const spanEnd = span.open ? end : span.end;
			if (spanEnd < start) continue;
			byLane.get(span.stage)?.push(span);
		}
		return byLane;
	});

	function linkFor(span: SpanMessage): string | null {
		if (span.from < oldest) return null;
		const url = new URL(page.url);
		url.searchParams.set('view', 'blocks');
		url.searchParams.set('at', String(span.from));
		url.hash = '';
		return `${url.pathname}${url.search}`;
	}

	function show(event: PointerEvent, span: SpanMessage) {
		const figure = (event.currentTarget as Element).closest('figure')!;
		const rect = figure.getBoundingClientRect();
		hovered = { span, x: event.clientX - rect.left, y: event.clientY - rect.top };
	}

	function blockCount(span: SpanMessage): string {
		const count = formatNumber(span.blocks, locale);
		// @wc-include
		return span.blocks === 1 ? `${count} block` : `${count} blocks`;
	}
</script>

<div class="grid gap-3">
	<div class="flex flex-wrap items-center justify-between gap-2">
		<p class="text-muted text-sm">
			{#if hours === 1}
				Last hour. Each mark is a run of blocks where a stage departed from normal.
			{:else}
				Last 24 h. Each mark is a run of blocks where a stage departed from normal.
			{/if}
		</p>
		<div class="bg-surface-container flex rounded-lg p-0.5 text-sm" role="group">
			<button
				class="cursor-pointer rounded-md px-2.5 py-1 {hours === 1
					? 'bg-surface text-on-surface'
					: 'text-muted'}"
				aria-pressed={hours === 1}
				onclick={() => (hours = 1)}>1 h</button
			>
			<button
				class="cursor-pointer rounded-md px-2.5 py-1 {hours === 24
					? 'bg-surface text-on-surface'
					: 'text-muted'}"
				aria-pressed={hours === 24}
				onclick={() => (hours = 24)}>24 h</button
			>
		</div>
	</div>
	<figure
		class="relative w-full min-w-0"
		bind:clientWidth={width}
		onpointerleave={() => (hovered = null)}
	>
		<svg
			viewBox="0 0 {width} {HEIGHT}"
			height={HEIGHT}
			class="block w-full"
			role="img"
			aria-label="Timeline"
		>
			{#each LANES as lane, k (lane)}
				<line
					x1={PAD_LEFT}
					x2={width}
					y1={(k + 1) * LANE_HEIGHT - 1}
					y2={(k + 1) * LANE_HEIGHT - 1}
					class="stroke-outline-variant"
				/>
				<text x="0" y={k * LANE_HEIGHT + 14} class="fill-muted text-[11px]">{stageLabel(lane)}</text
				>
				{#each lanes.get(lane) ?? [] as span (span.id)}
					{@const x0 = Math.max(PAD_LEFT, x(span.start))}
					{@const x1 = Math.max(x0 + 3, x((span.open ? end : span.end) + 500))}
					{@const link = linkFor(span)}
					{#if link}
						<a
							href={link}
							aria-label="{stageLabel(span.stage)}: {reasonLabel(span.reason)}, #{span.from}"
							data-sveltekit-noscroll
							data-sveltekit-replacestate
						>
							<rect
								x={x0}
								y={k * LANE_HEIGHT + 3}
								width={x1 - x0}
								height={LANE_HEIGHT - 7}
								rx="2"
								class={lane === 'feed' ? 'fill-outline' : 'fill-warning'}
								onpointerenter={(event) => show(event, span)}
								onpointermove={(event) => show(event, span)}
							/>
						</a>
					{:else}
						<rect
							x={x0}
							y={k * LANE_HEIGHT + 3}
							width={x1 - x0}
							height={LANE_HEIGHT - 7}
							rx="2"
							class={lane === 'feed' ? 'fill-outline' : 'fill-warning'}
							role="presentation"
							onpointerenter={(event) => show(event, span)}
							onpointermove={(event) => show(event, span)}
							onpointerdown={(event) => show(event, span)}
						/>
					{/if}
				{/each}
			{/each}
			{#each end ? Array.from({ length: ticks + 1 }, (_, k) => k) : [] as k (k)}
				{@const t = start + (k / ticks) * range}
				<text
					x={x(t)}
					y={HEIGHT - 4}
					text-anchor={k === 0 ? 'start' : k === ticks ? 'end' : 'middle'}
					class="fill-muted text-[11px]">{formatClock(t).slice(0, 5)}</text
				>
			{/each}
		</svg>
		{#if hovered}
			{@const span = hovered.span}
			<div
				class="bg-surface-container-highest pointer-events-none absolute z-10 grid min-w-56 gap-0.5 rounded-lg px-3 py-2 text-xs whitespace-nowrap shadow-lg"
				style:left="{Math.min(Math.max(0, hovered.x + 12), width - 220)}px"
				style:top="{hovered.y + 12}px"
			>
				<b>{stageLabel(span.stage)}: {reasonLabel(span.reason)}</b>
				<span class="font-mono">
					{formatClock(span.start)}–{span.open ? formatClock(end) : formatClock(span.end + 500)} UTC
				</span>
				<span>#{span.from}–#{span.to} · {blockCount(span)}</span>
				{#if span.open}<span class="text-muted">Still open</span>{/if}
				{#if linkFor(span)}<span class="text-muted">Open the run in Blocks</span>{/if}
			</div>
		{/if}
	</figure>
	<div class="text-on-surface-variant flex flex-wrap gap-4 text-xs">
		<span class="flex items-center gap-1.5"
			><i class="bg-warning inline-block size-2.5 rounded-sm"></i>Departure or above baseline</span
		>
		<span class="flex items-center gap-1.5"
			><i class="bg-outline inline-block size-2.5 rounded-sm"></i>Feed, this page's own vantage</span
		>
	</div>
</div>
