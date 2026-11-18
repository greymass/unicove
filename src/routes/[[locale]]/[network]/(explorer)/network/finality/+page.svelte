<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import { Card, Stack } from '@wharfkit/svelte-components';

	import { finality, headline, stageReadings, windowStats } from '$lib/state/finality/derive';
	import { FinalityFeed } from '$lib/state/finality/feed.svelte';
	import { baselineCovered } from '$lib/state/finality/markers';
	import { emptyState } from '$lib/state/finality/state';
	import type { Qc } from '$lib/state/finality/v1';
	import BlockStream from '$lib/components/finality/blockstream.svelte';
	import FeedBanner from '$lib/components/finality/feedbanner.svelte';
	import Finalizers from '$lib/components/finality/finalizers.svelte';
	import Headline from '$lib/components/finality/headline.svelte';
	import { formatClock } from '$lib/components/finality/labels.svelte';
	import Policy from '$lib/components/finality/policy.svelte';
	import Producers from '$lib/components/finality/producers.svelte';
	import Stages from '$lib/components/finality/stages.svelte';
	import Tabs, { type FinalityView } from '$lib/components/finality/tabs.svelte';
	import Timeline from '$lib/components/finality/timeline.svelte';
	import TtfChart from '$lib/components/finality/ttfchart.svelte';
	import VoteGrid from '$lib/components/finality/votegrid.svelte';

	const { data } = $props();

	let feed: FinalityFeed | undefined = $state();

	onMount(() => {
		const { endpoints, short } = data.network.config;
		if (!endpoints.finality) return;
		const instance = new FinalityFeed(endpoints.finality, short);
		feed = instance;
		instance.start();
		return () => {
			instance.stop();
			feed = undefined;
		};
	});

	const host = $derived.by(() => {
		try {
			return new URL(data.network.config.endpoints.api).host;
		} catch {
			return data.network.config.endpoints.api;
		}
	});

	const current = $derived(feed?.state ?? emptyState());
	const connection = $derived(feed?.connection ?? 'connecting');
	const now = $derived(feed?.now ?? 0);
	const records = $derived(finality(current));
	const stats = $derived(windowStats(current, records));
	const readings = $derived(
		stageReadings(current, stats, { reconnecting: connection === 'reconnecting' })
	);
	const finalReading = $derived(readings.find((reading) => reading.stage === 'final')!);
	const newest = $derived(current.blocks[current.blocks.length - 1]);
	const stalled = $derived(current.feed?.state === 'paused' || connection === 'reconnecting');
	const asOf = $derived(stalled && newest ? newest.timestamp : null);
	const timelineEnd = $derived.by(() => {
		const last = Math.max(newest?.timestamp ?? 0, current.feed?.last_block_time ?? 0);
		return stalled && last ? Math.max(last, now) : last;
	});

	const qcOn = $derived.by(() => {
		const map = new Map<number, Qc>();
		for (const block of current.blocks) if (block.qc) map.set(block.qc.block_num, block.qc);
		return map;
	});

	const view: FinalityView = $derived.by(() => {
		const param = page.url.searchParams.get('view');
		return param === 'producers' || param === 'blocks' ? param : 'status';
	});

	const highlight: [number, number] | null = $derived.by(() => {
		const at = Number(page.url.searchParams.get('at'));
		if (view !== 'blocks' || !Number.isInteger(at) || at <= 0) return null;
		for (const span of current.spans.values()) if (span.from === at) return [span.from, span.to];
		return [at, at];
	});

	const scheduleVersion = $derived(
		newest?.schedule_version ?? current.hello?.schedule_version ?? null
	);
	const producerOrder = $derived(
		scheduleVersion !== null
			? (current.schedules.get(scheduleVersion)?.producers ??
					stats.producers.map((p) => p.producer))
			: stats.producers.map((p) => p.producer)
	);
	const latencyP99 = $derived(
		baselineCovered(current.baseline) ? current.baseline.latency_p99 : null
	);
</script>

<Stack class="gap-4">
	<p class="text-muted text-sm">
		Savanna finality as seen from {host}.
		{#if newest}Head #{newest.block_num} · {formatClock(newest.timestamp)} UTC{/if}
	</p>

	<FeedBanner {connection} {current} {now} />

	<div class="grid grid-cols-[minmax(0,1fr)] gap-4 min-[860px]:grid-cols-[18.75rem_minmax(0,1fr)]">
		<Card>
			<Headline
				value={headline(records)}
				status={finalReading.status}
				baseline={current.baseline}
				{asOf}
			/>
		</Card>
		<Card>
			<div class="flex flex-wrap items-baseline justify-between gap-2 pb-3">
				<h3 class="text-title">Time to final per block</h3>
				<span class="text-muted text-sm">last 2 min</span>
			</div>
			<div class:opacity-60={asOf !== null}>
				<TtfChart {current} {records} {qcOn} />
			</div>
		</Card>
	</div>

	<Stages {readings} empty={!current.blocks.length} dim={asOf !== null} />

	<div class="mt-4">
		<Tabs {view} />
	</div>

	{#if view === 'status'}
		<Card title="Timeline">
			<Timeline {current} end={timelineEnd} />
		</Card>
	{:else if view === 'producers'}
		<div class="grid grid-cols-[minmax(0,1fr)] gap-4 xl:grid-cols-2">
			<Card title="Producers">
				<Producers producers={stats.producers} ready={current.ready} {latencyP99} />
			</Card>
			<Card title="Finalizers" id="finalizers">
				<Finalizers
					finalizers={stats.finalizers}
					baseline={current.baseline?.finalizers ?? []}
					generation={current.policy?.generation ?? null}
					ready={current.ready}
				/>
			</Card>
		</div>
	{:else}
		<Card title="Blocks">
			<BlockStream {current} {records} {highlight} />
		</Card>
		<div class="grid grid-cols-[minmax(0,1fr)] gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
			<Card title="Missing votes by QC block producer">
				<VoteGrid
					finalizers={stats.finalizers}
					producers={producerOrder}
					baseline={current.baseline}
				/>
			</Card>
			<Card title="Finalizer policy">
				<Policy policy={current.policy} {scheduleVersion} />
			</Card>
		</div>
	{/if}
</Stack>
