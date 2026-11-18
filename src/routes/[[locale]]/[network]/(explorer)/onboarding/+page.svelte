<script lang="ts">
	import { getContext } from 'svelte';
	import { Card } from '@wharfkit/svelte-components';
	import type { UnicoveContext } from '$lib/state/client.svelte';
	import type { ProgramEvent } from '$lib/state/creationindex/client';
	import type { GiftProgram } from '$lib/state/creationindex/giftprogram.svelte';
	import {
		OBSERVED_DAYS,
		chainTime,
		creatorTotals,
		usedNow
	} from '$lib/state/creationindex/onboarding';
	import GiftsChart from '$lib/components/onboarding/giftschart.svelte';
	import Status from '$lib/components/onboarding/status.svelte';
	import { eventLabel, runwayText } from '$lib/components/onboarding/labels.svelte';
	import { formatBytes } from '$lib/utils/bytes';
	import { formatDateTime, formatNumber } from '$lib/utils/intl';

	const RECENT = 6;

	const context = getContext<UnicoveContext>('state');
	const program = getContext<GiftProgram>('giftprogram');
	const locale = $derived(context.settings.data.locale);

	const observed = $derived(program.observed);
	const committed = $derived(program.committed);
	const endowment = $derived(program.endowment);

	let recent = $state<ProgramEvent[]>([]);
	let recentFailed = $state(false);
	program.client
		.getProgramEvents({}, { order: 'desc', limit: RECENT })
		.then((page) => (recent = page.events))
		.catch(() => (recentFailed = true));

	const date = (time: string) =>
		formatDateTime(new Date(chainTime(time)), locale, {
			dateStyle: 'medium',
			timeStyle: undefined
		});
</script>

<div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
	<Card>
		<p class="text-muted text-label-sm">Endowment available</p>
		<p class="text-headline font-mono tabular-nums">{formatBytes(program.available)}</p>
		{#if endowment && endowment.ram_quota > 0}
			<div class="bg-surface-container-high h-1.5 overflow-hidden rounded-full">
				<div
					class="bg-primary h-full"
					style:width="{(endowment.available_bytes / endowment.ram_quota) * 100}%"
				></div>
			</div>
			<p class="text-muted text-sm">of {formatBytes(endowment.ram_quota)} held</p>
		{/if}
	</Card>
	<Card>
		<p class="text-muted text-label-sm">Observed runway</p>
		<p class="text-headline">{runwayText(observed.runway, locale)}</p>
		<p class="text-muted text-sm">
			at {formatBytes(Math.max(0, observed.perDay))} a day, the last {OBSERVED_DAYS} days' net outflow
		</p>
	</Card>
	<Card>
		<p class="text-muted text-label-sm">Committed runway</p>
		<p class="text-headline">
			{#if committed.disabled}
				Program disabled
			{:else if committed.runway === null}
				No active quota
			{:else}
				{runwayText(committed.runway, locale)}
			{/if}
		</p>
		<p class="text-muted text-sm">
			{#if committed.activeCreators === 1}
				{formatBytes(committed.activeQuota)} daily quota across 1 creator
			{:else}
				{formatBytes(committed.activeQuota)} daily quota across {formatNumber(
					committed.activeCreators,
					locale
				)} creators
			{/if}{#if committed.suspendedQuota}<span class="text-error"
					>, plus {formatBytes(committed.suspendedQuota)} suspended</span
				>{/if}
		</p>
	</Card>
	<Card>
		<p class="text-muted text-label-sm">Program</p>
		<p class="text-headline">{program.enabled ? 'Enabled' : 'Disabled'}</p>
		<p class="text-muted text-sm">
			{formatNumber(program.creators.length, locale)} registered, {formatNumber(
				program.suspendedCount,
				locale
			)} suspended
		</p>
	</Card>
</div>

<Card title="Bytes gifted per day">
	<GiftsChart daily={program.daily} now={program.now} />
	<p class="text-muted text-sm">
		{formatNumber(observed.gifts, locale)} gifts in the last {OBSERVED_DAYS} days, {formatBytes(
			observed.giftBytes
		)} gifted, {formatBytes(observed.returns)} returned
	</p>
</Card>

<div class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_24rem]">
	<Card title="Creators">
		<div class="overflow-x-auto">
			<table class="w-full text-sm">
				<thead class="text-muted text-left">
					<tr class="border-outline border-b">
						<th class="py-2 font-normal">Creator</th>
						<th class="py-2 text-right font-normal">Daily quota</th>
						<th class="py-2 text-right font-normal">Used this window</th>
						<th class="py-2 text-right font-normal">Gifts, {OBSERVED_DAYS} days</th>
						<th class="py-2"></th>
					</tr>
				</thead>
				<tbody>
					{#each program.creators as row (row.creator)}
						<tr class="border-outline/50 border-b">
							<td class="py-2">
								<a
									class="text-primary"
									href={context.urlPath(`/onboarding/creators/${row.creator}`)}
								>
									{row.creator}
								</a>
							</td>
							<td class="py-2 text-right font-mono tabular-nums">
								{formatBytes(row.daily_quota_bytes)}
							</td>
							<td class="py-2 text-right font-mono tabular-nums">
								{formatBytes(usedNow(row, program.now))}
							</td>
							<td class="py-2 text-right tabular-nums">
								{formatNumber(
									creatorTotals(program.daily, row.creator, OBSERVED_DAYS, program.now).gifts,
									locale
								)}
							</td>
							<td class="py-2 text-right">
								<Status suspended={row.suspended} enabled={program.enabled} />
							</td>
						</tr>
					{:else}
						<tr><td class="text-muted py-2" colspan="5">No creators are registered.</td></tr>
					{/each}
				</tbody>
			</table>
		</div>
	</Card>

	<Card title="Recent events">
		{#if recentFailed}
			<p class="text-muted text-sm">Recent events are unavailable right now.</p>
		{:else}
			<ol class="grid gap-2 text-sm">
				{#each recent as event (event.global_seq)}
					<li class="flex items-baseline justify-between gap-3">
						<span>
							{eventLabel(event.action)}
							<span class="text-muted">{event.program_creator || event.to}</span>
						</span>
						<span class="text-muted text-xs whitespace-nowrap">{date(event.block_time)}</span>
					</li>
				{:else}
					<li class="text-muted">No events yet.</li>
				{/each}
			</ol>
		{/if}
		<a class="text-primary text-sm" href={context.urlPath('/onboarding/events')}>All events ›</a>
	</Card>
</div>
