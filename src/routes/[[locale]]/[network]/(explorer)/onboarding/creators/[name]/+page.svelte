<script lang="ts">
	import { getContext } from 'svelte';
	import { Button, Card } from '@wharfkit/svelte-components';
	import type { UnicoveContext } from '$lib/state/client.svelte';
	import {
		CreationindexError,
		type Creation,
		type QuotaHistory
	} from '$lib/state/creationindex/client';
	import type { GiftProgram } from '$lib/state/creationindex/giftprogram.svelte';
	import {
		DEFAULT_QUOTA,
		chainTime,
		usedNow,
		windowEnd
	} from '$lib/state/creationindex/onboarding';
	import GiftsChart from '$lib/components/onboarding/giftschart.svelte';
	import Propose from '$lib/components/onboarding/propose.svelte';
	import Status from '$lib/components/onboarding/status.svelte';
	import { eventLabel } from '$lib/components/onboarding/labels.svelte';
	import { formatBytes } from '$lib/utils/bytes';
	import { formatDateTime, formatNumber } from '$lib/utils/intl';

	const PAGE_SIZE = 25;

	const { data } = $props();
	const context = getContext<UnicoveContext>('state');
	const program = getContext<GiftProgram>('giftprogram');
	const locale = $derived(context.settings.data.locale);
	const name = $derived(data.creator);
	const row = $derived(program.row(name));

	let quota = $state<QuotaHistory | null>(null);
	let quotaFailed = $state(false);

	$effect(() => {
		const creator = name;
		quota = null;
		quotaFailed = false;
		program.client
			.getQuota(creator)
			.then((q) => {
				if (creator === name) quota = q;
			})
			.catch((e) => {
				if (creator !== name) return;
				if (e instanceof CreationindexError && e.status === 404) {
					quota = { program_creator: creator, registrations: [] };
				} else {
					quotaFailed = true;
				}
			});
	});

	let accounts = $state<Creation[]>([]);
	let before = $state<number | undefined>(undefined);
	let more = $state(false);
	let listLoading = $state(false);
	let listFailed = $state(false);
	let listRequest = 0;

	async function loadPage(reset: boolean) {
		const creator = name;
		const id = ++listRequest;
		listLoading = true;
		listFailed = false;
		try {
			const page = await program.client.getCreations(
				{ program_creator: creator },
				{ order: 'desc', before: reset ? undefined : before, limit: PAGE_SIZE }
			);
			if (id !== listRequest) return;
			accounts = reset ? page.creations : [...accounts, ...page.creations];
			before = page.next;
			more = page.more;
		} catch {
			if (id === listRequest) listFailed = true;
		} finally {
			if (id === listRequest) listLoading = false;
		}
	}

	$effect(() => {
		void name;
		accounts = [];
		loadPage(true);
	});

	$effect(() => {
		if (program.proposals !== null) return;
		context.network.abis
			?.getAbi(program.contract)
			.then((abi) => program.loadProposals((p, n) => context.urlPath(`/api/msig/${p}/${n}`), abi));
	});

	const windows = $derived(quota?.registrations.flatMap((r) => r.windows).toReversed() ?? []);
	const history = $derived(
		(quota?.registrations ?? [])
			.flatMap((r) => [
				...r.quotas.map((q) => ({
					time: q.time,
					text: `${eventLabel(q.action)}: ${formatBytes(q.daily_quota_bytes)}`
				})),
				...r.suspensions.flatMap((s) => [
					{ time: s.suspended, text: eventLabel('suspend') },
					...(s.resumed ? [{ time: s.resumed, text: eventLabel('resume') }] : [])
				]),
				...(r.removed ? [{ time: r.removed, text: eventLabel('rmcreator') }] : [])
			])
			.toSorted((a, b) => chainTime(b.time) - chainTime(a.time))
	);

	const time = (t: string) =>
		formatDateTime(new Date(chainTime(t)), locale, { dateStyle: 'medium', timeStyle: 'short' });
	const relative = (ms: number) => {
		const hours = Math.max(0, Math.round((ms - program.now) / 3_600_000));
		return new Intl.RelativeTimeFormat(locale, { numeric: 'auto' }).format(hours, 'hour');
	};
	const gifted = (creation: Creation) =>
		creation.contributions
			.filter((c) => c.kind === 'program_gift')
			.reduce((sum, c) => sum + (c.bytes ?? 0), 0);
</script>

<div class="grid gap-6 xl:grid-cols-[minmax(0,1fr)_20rem]">
	<div class="grid min-w-0 content-start gap-6">
		<Card title="Current window">
			{#if row}
				{@const used = usedNow(row, program.now)}
				{@const ends = windowEnd(row, program.now)}
				<dl class="grid grid-cols-[10rem_1fr] gap-y-2 text-sm">
					<dt class="text-muted">Status</dt>
					<dd><Status suspended={row.suspended} enabled={program.enabled} /></dd>
					<dt class="text-muted">Daily quota</dt>
					<dd class="font-mono">
						{formatBytes(row.daily_quota_bytes)}
						<span class="text-muted">
							({formatNumber(row.daily_quota_bytes, locale)} bytes)
						</span>
					</dd>
					<dt class="text-muted">Used this window</dt>
					<dd>
						<div class="bg-surface-container-high mb-1 h-2 max-w-xs overflow-hidden rounded-full">
							<div
								class="bg-primary h-full"
								style:width="{Math.min(100, (used / row.daily_quota_bytes) * 100)}%"
							></div>
						</div>
						<span class="font-mono">{formatBytes(used)}</span>,
						{formatBytes(Math.max(0, row.daily_quota_bytes - used))} left
					</dd>
					<dt class="text-muted">Window</dt>
					<dd>
						{#if ends !== null && row.window_start !== null}
							Opened {time(new Date(row.window_start).toISOString())}, resets {relative(ends)}
						{:else}
							Opens on the next gift
						{/if}
					</dd>
				</dl>
			{:else}
				<p class="text-muted">{name} is not a registered creator.</p>
			{/if}
		</Card>

		<Card title="Gifts per day">
			<GiftsChart daily={program.daily} now={program.now} creator={name} height="12rem" />
		</Card>

		<Card title="Quota windows">
			{#if quotaFailed}
				<p class="text-muted text-sm">Quota windows are unavailable right now.</p>
			{:else if windows.length}
				<div class="overflow-x-auto">
					<table class="w-full text-sm">
						<thead class="text-muted text-left">
							<tr class="border-outline border-b">
								<th class="py-2 font-normal">Opened</th>
								<th class="py-2 text-right font-normal">Gifts</th>
								<th class="py-2 text-right font-normal">Used</th>
								<th class="py-2 text-right font-normal">Quota</th>
								<th class="py-2 text-right font-normal">Ended</th>
							</tr>
						</thead>
						<tbody>
							{#each windows as w (w.start)}
								<tr class="border-outline/50 border-b">
									<td class="py-1.5">{time(w.start)}</td>
									<td class="py-1.5 text-right tabular-nums">{formatNumber(w.gifts, locale)}</td>
									<td class="py-1.5 text-right font-mono tabular-nums">
										{formatBytes(w.used_bytes)}
									</td>
									<td class="py-1.5 text-right font-mono tabular-nums">
										{formatBytes(w.daily_quota_bytes)}
									</td>
									<td class="text-muted py-1.5 text-right">
										{#if w.open}
											Open
										{:else if w.ended_by}
											{eventLabel(w.ended_by)}
										{:else}
											After 24 hours
										{/if}
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			{:else if quota}
				<p class="text-muted text-sm">No quota window has opened.</p>
			{/if}
		</Card>

		<div class="grid gap-6 lg:grid-cols-2">
			<Card title="Registration history">
				<ul class="grid gap-1.5 text-sm">
					{#each history as entry (entry.time + entry.text)}
						<li class="flex justify-between gap-3">
							<span>{entry.text}</span>
							<span class="text-muted text-xs whitespace-nowrap">{time(entry.time)}</span>
						</li>
					{:else}
						<li class="text-muted">No registrations.</li>
					{/each}
				</ul>
			</Card>
			<Card title="Gifted accounts">
				<ul class="grid gap-1.5 text-sm">
					{#each accounts as creation (creation.global_seq)}
						<li class="flex items-baseline justify-between gap-3">
							<a
								class="text-primary font-mono"
								href={context.urlPath(`/account/${creation.account}`)}
							>
								{creation.account}
							</a>
							<span class="text-muted font-mono text-xs tabular-nums">
								{formatBytes(gifted(creation))} · {formatDateTime(
									new Date(chainTime(creation.block_time)),
									locale,
									{ dateStyle: 'medium', timeStyle: undefined }
								)}
							</span>
						</li>
					{:else}
						{#if !listLoading && !listFailed}
							<li class="text-muted">No gifted accounts.</li>
						{/if}
					{/each}
				</ul>
				{#if listFailed}
					<p class="text-error text-sm">Gifted accounts are unavailable right now.</p>
				{:else if listLoading}
					<p class="text-muted animate-pulse text-sm">Loading accounts...</p>
				{:else if more}
					<Button variant="secondary" onclick={() => loadPage(false)}>Show older</Button>
				{/if}
			</Card>
		</div>
	</div>

	{#key name}
		<aside class="grid content-start gap-4">
			<p class="text-muted text-label-sm">Propose a change</p>
			{#if row}
				<Card title="Set quota">
					<Propose
						{program}
						action="setquota"
						creator={name}
						quota={row.daily_quota_bytes}
						withLink
					/>
				</Card>
				{#if row.suspended}
					<Card title="Resume {name}">
						<p class="text-muted text-sm">Lets {name} gift again.</p>
						<Propose {program} action="resume" creator={name} />
					</Card>
				{:else}
					<Card title="Suspend {name}">
						<p class="text-muted text-sm">Stops {name}'s gifts and keeps its registration.</p>
						<Propose {program} action="suspend" creator={name} />
					</Card>
				{/if}
				<Card title="Remove {name}">
					<p class="text-muted text-sm">Deletes the registration, quota and window.</p>
					<Propose {program} action="rmcreator" creator={name} />
				</Card>
			{:else}
				<Card title="Add {name}">
					<Propose {program} action="addcreator" creator={name} quota={DEFAULT_QUOTA} withLink />
				</Card>
			{/if}
		</aside>
	{/key}
</div>
