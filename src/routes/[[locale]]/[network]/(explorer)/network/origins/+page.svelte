<script lang="ts">
	import { getContext } from 'svelte';
	import { Card, Stack } from '@wharfkit/svelte-components';
	import type { UnicoveContext } from '$lib/state/client.svelte';
	import {
		CreationindexClient,
		type CreationDay,
		type DayCreator
	} from '$lib/state/creationindex/client';
	import {
		KIND_COLORS,
		ORIGIN_KINDS,
		kindCount,
		loadDays,
		loadRanking,
		sumTotals
	} from '$lib/state/creationindex/origins';
	import { DEFAULT_STAT_WINDOW, type StatWindow } from '$lib/state/statindex/utils';
	import { formatNumber } from '$lib/utils/intl';
	import KindChart from '$lib/components/origins/kindchart.svelte';
	import KindBar from '$lib/components/origins/kindbar.svelte';
	import KindBytes from '$lib/components/origins/kindbytes.svelte';
	import WindowPills from '$lib/components/origins/windowpills.svelte';
	import { kindLabel, kindSentence, windowLabel } from '$lib/components/origins/labels.svelte';

	const RANKING_ROWS = 10;

	const { data } = $props();
	const context = getContext<UnicoveContext>('state');
	const locale = $derived(context.settings.data.locale);
	const client = new CreationindexClient(context.urlPath('/api/creationindex'));
	const supported = $derived(data.network.supports('creationindex'));

	let statWindow = $state<StatWindow>(DEFAULT_STAT_WINDOW);
	let days = $state<CreationDay[]>([]);
	let ranking = $state<DayCreator[]>([]);
	let loaded = $state(false);
	let failed = $state(false);
	let requestId = 0;

	$effect(() => {
		if (!supported) return;
		const window = statWindow;
		const id = ++requestId;
		failed = false;
		Promise.all([loadDays(client, window), loadRanking(client, window, RANKING_ROWS)])
			.then(([windowDays, windowRanking]) => {
				if (id !== requestId) return;
				days = windowDays;
				ranking = windowRanking;
				loaded = true;
			})
			.catch(() => {
				if (id === requestId) failed = true;
			});
	});

	const totals = $derived(sumTotals(days));
	const top = $derived(Math.max(1, ...ranking.map((row) => row.creations)));
</script>

<Stack class="gap-6">
	{#if !supported}
		<p class="text-muted">Account origins are unavailable on this network.</p>
	{:else if failed}
		<p class="text-error">Account origins are unavailable right now.</p>
	{:else if !loaded}
		<p class="text-muted animate-pulse">Loading account origins...</p>
	{:else}
		<div class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
			<Card title="Creations by how RAM arrived">
				<KindChart {days} monthly={statWindow === 'all'} height="25.5rem" />
				<div class="flex flex-wrap items-center justify-between gap-3">
					<p class="text-muted text-sm">{formatNumber(totals.creations, locale)} accounts</p>
					<WindowPills bind:value={statWindow} />
				</div>
			</Card>

			<Card title="Top creators">
				<p class="text-muted -mt-2 text-sm">{windowLabel(statWindow)}</p>
				<ol class="grid gap-2.5">
					{#each ranking as row, index (row.creator)}
						<li class="grid grid-cols-[1.25rem_minmax(0,1fr)_auto] items-center gap-x-2 gap-y-1">
							<span class="text-muted text-right font-mono text-xs">{index + 1}</span>
							<a
								class="text-primary truncate font-medium"
								href={context.urlPath(`/network/origins/${row.creator}`)}>{row.creator}</a
							>
							<span class="font-mono text-sm tabular-nums">
								{formatNumber(row.creations, locale)}
							</span>
							<span></span>
							<div class="col-span-2" style:width="{Math.max(2, (row.creations / top) * 100)}%">
								<KindBar totals={row} class="h-1.5" />
							</div>
						</li>
					{/each}
				</ol>
			</Card>
		</div>

		<Card title="How RAM arrives">
			<div class="grid gap-x-8 gap-y-4 md:grid-cols-2 xl:grid-cols-3">
				{#each ORIGIN_KINDS as kind (kind)}
					{@const count = kindCount(totals, kind)}
					<div class="grid gap-1" class:opacity-50={count === 0}>
						<div class="flex items-center gap-2">
							<span class="size-3 rounded-sm" style:background={KIND_COLORS[kind]}></span>
							<span class="font-medium">{kindLabel(kind)}</span>
							<span class="ml-auto font-mono text-sm tabular-nums">
								{formatNumber(count, locale)}
							</span>
						</div>
						<p class="text-muted text-sm">{kindSentence(kind)}</p>
						{#if kind !== 'none' && count > 0}
							<p class="text-sm"><KindBytes figures={totals.kinds[kind]} /></p>
						{/if}
					</div>
				{/each}
			</div>
		</Card>
	{/if}
</Stack>
