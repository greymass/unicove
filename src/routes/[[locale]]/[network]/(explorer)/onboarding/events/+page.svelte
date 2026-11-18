<script lang="ts">
	import { getContext } from 'svelte';
	import { Button, Card } from '@wharfkit/svelte-components';
	import type { UnicoveContext } from '$lib/state/client.svelte';
	import type { ProgramEvent, ProgramEventType } from '$lib/state/creationindex/client';
	import type { GiftProgram } from '$lib/state/creationindex/giftprogram.svelte';
	import { chainTime } from '$lib/state/creationindex/onboarding';
	import { eventFilterLabel, eventLabel } from '$lib/components/onboarding/labels.svelte';
	import { formatBytes } from '$lib/utils/bytes';
	import { formatDateTime } from '$lib/utils/intl';

	const PAGE_SIZE = 50;
	const FILTERS: (ProgramEventType | 'all')[] = [
		'all',
		'program_gift',
		'return',
		'admin',
		'ram_movement'
	];

	const context = getContext<UnicoveContext>('state');
	const program = getContext<GiftProgram>('giftprogram');
	const locale = $derived(context.settings.data.locale);

	let filter = $state<ProgramEventType | 'all'>('all');
	let creator = $state('');

	let events = $state<ProgramEvent[]>([]);
	let before = $state<number | undefined>(undefined);
	let more = $state(false);
	let loading = $state(false);
	let failed = $state(false);
	let request = 0;

	async function loadPage(reset: boolean) {
		const id = ++request;
		loading = true;
		failed = false;
		try {
			const page = await program.client.getProgramEvents(
				{
					type: filter === 'all' ? undefined : filter,
					program_creator: creator || undefined
				},
				{ order: 'desc', before: reset ? undefined : before, limit: PAGE_SIZE }
			);
			if (id !== request) return;
			events = reset ? page.events : [...events, ...page.events];
			before = page.next;
			more = page.more;
		} catch {
			if (id === request) failed = true;
		} finally {
			if (id === request) loading = false;
		}
	}

	$effect(() => {
		void filter;
		void creator;
		events = [];
		loadPage(true);
	});

	const account = (event: ProgramEvent) =>
		event.to && event.to !== program.contract ? event.to : event.from;
	const amount = (event: ProgramEvent) =>
		event.bytes !== null
			? formatBytes(event.bytes)
			: event.daily_quota_bytes !== null
				? `${formatBytes(event.daily_quota_bytes)}/day`
				: '';
</script>

<div class="flex flex-wrap items-center gap-2">
	{#each FILTERS as key (key)}
		<button
			type="button"
			class="text-label-sm rounded-full px-3 py-1 {filter === key
				? 'bg-primary text-on-primary'
				: 'bg-surface-container hover:bg-surface-container-high'}"
			aria-pressed={filter === key}
			onclick={() => (filter = key)}>{eventFilterLabel(key)}</button
		>
	{/each}
	<select
		class="bg-surface-container ml-auto rounded-lg px-2 py-1 text-sm"
		aria-label="Creator"
		bind:value={creator}
	>
		<option value="">Every creator</option>
		{#each program.listing as listed (listed.name)}
			<option value={listed.name}>{listed.name}</option>
		{/each}
	</select>
</div>

<Card>
	{#if events.length}
		<div class="overflow-x-auto">
			<table class="w-full text-sm">
				<thead class="text-muted text-left">
					<tr class="border-outline border-b">
						<th class="py-2 font-normal">Time</th>
						<th class="py-2 font-normal">Event</th>
						<th class="py-2 font-normal">Creator</th>
						<th class="py-2 font-normal">Account</th>
						<th class="py-2 text-right font-normal">Bytes</th>
						<th class="py-2 pl-4 font-normal">Memo</th>
						<th class="py-2 pl-4 font-normal">Transaction</th>
					</tr>
				</thead>
				<tbody>
					{#each events as event (event.global_seq)}
						<tr class="border-outline/50 border-b">
							<td class="text-muted py-1.5 whitespace-nowrap">
								{formatDateTime(new Date(chainTime(event.block_time)), locale, {
									dateStyle: 'short',
									timeStyle: 'short'
								})}
							</td>
							<td class="py-1.5">{eventLabel(event.action)}</td>
							<td class="py-1.5">
								{#if event.program_creator}
									<a
										class="text-primary"
										href={context.urlPath(`/onboarding/creators/${event.program_creator}`)}
										>{event.program_creator}</a
									>
								{/if}
							</td>
							<td class="py-1.5">
								{#if account(event)}
									<a
										class="text-primary font-mono"
										href={context.urlPath(`/account/${account(event)}`)}
									>
										{account(event)}
									</a>
								{/if}
							</td>
							<td class="py-1.5 text-right font-mono tabular-nums">{amount(event)}</td>
							<td class="text-muted max-w-48 truncate py-1.5 pl-4" title={event.memo}
								>{event.memo}</td
							>
							<td class="py-1.5 pl-4">
								<a
									class="text-primary font-mono text-xs"
									href={context.urlPath(`/transaction/${event.trx_id}`)}
									>{event.trx_id.slice(0, 8)}</a
								>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{:else if !loading && !failed}
		<p class="text-muted text-sm">No events match.</p>
	{/if}
	{#if failed}
		<p class="text-error text-sm">Events are unavailable right now.</p>
	{:else if loading}
		<p class="text-muted animate-pulse text-sm">Loading events...</p>
	{:else if more}
		<Button variant="secondary" onclick={() => loadPage(false)}>Show older</Button>
	{/if}
</Card>
