<script lang="ts">
	import { getContext } from 'svelte';
	import { Button, Card, Stack } from '@wharfkit/svelte-components';
	import type { UnicoveContext } from '$lib/state/client.svelte';
	import {
		CreationindexClient,
		type Creation,
		type CreationDay
	} from '$lib/state/creationindex/client';
	import {
		CONTRIBUTION_KINDS,
		KIND_COLORS,
		creationKind,
		loadDays,
		sumTotals
	} from '$lib/state/creationindex/origins';
	import { DEFAULT_STAT_WINDOW, type StatWindow } from '$lib/state/statindex/utils';
	import { formatDateTime, formatNumber } from '$lib/utils/intl';
	import KindChart from '$lib/components/origins/kindchart.svelte';
	import KindBytes from '$lib/components/origins/kindbytes.svelte';
	import ContributionBytes from '$lib/components/origins/contributionbytes.svelte';
	import WindowPills from '$lib/components/origins/windowpills.svelte';
	import { kindLabel } from '$lib/components/origins/labels.svelte';

	const PAGE_SIZE = 25;

	const { data } = $props();
	const context = getContext<UnicoveContext>('state');
	const locale = $derived(context.settings.data.locale);
	const client = new CreationindexClient(context.urlPath('/api/creationindex'));
	const supported = $derived(data.network.supports('creationindex'));

	let statWindow = $state<StatWindow>(DEFAULT_STAT_WINDOW);
	let days = $state<CreationDay[]>([]);
	let daysFailed = $state(false);
	let daysRequest = 0;

	$effect(() => {
		if (!supported) return;
		const window = statWindow;
		const creator = data.creator;
		const id = ++daysRequest;
		daysFailed = false;
		loadDays(client, window, creator)
			.then((result) => {
				if (id === daysRequest) days = result;
			})
			.catch(() => {
				if (id === daysRequest) daysFailed = true;
			});
	});

	let creations = $state<Creation[]>([]);
	let before = $state<number | undefined>(undefined);
	let more = $state(false);
	let listLoading = $state(false);
	let listFailed = $state(false);
	let listRequest = 0;

	async function loadPage(reset: boolean) {
		const creator = data.creator;
		const id = ++listRequest;
		listLoading = true;
		listFailed = false;
		try {
			const page = await client.getCreations(
				{ creator },
				{ order: 'desc', before: reset ? undefined : before, limit: PAGE_SIZE }
			);
			if (id !== listRequest) return;
			creations = reset ? page.creations : [...creations, ...page.creations];
			before = page.next;
			more = page.more;
		} catch {
			if (id === listRequest) listFailed = true;
		} finally {
			if (id === listRequest) listLoading = false;
		}
	}

	$effect(() => {
		if (!supported) return;
		void data.creator;
		creations = [];
		loadPage(true);
	});

	const totals = $derived(sumTotals(days));
	const created = (time: string) =>
		formatDateTime(new Date(time), locale, {
			dateStyle: 'medium',
			timeStyle: 'short',
			// @wc-ignore
			timeZone: 'UTC'
		});
</script>

<Stack class="gap-6">
	{#if !supported}
		<p class="text-muted">Account origins are unavailable on this network.</p>
	{:else}
		<Card title="Accounts created by day">
			{#if daysFailed}
				<p class="text-error">Daily figures are unavailable right now.</p>
			{:else}
				<KindChart {days} monthly={statWindow === 'all'} height="16rem" />
			{/if}
			<div class="flex flex-wrap items-center justify-between gap-3">
				<p class="text-muted flex flex-wrap gap-x-5 gap-y-1 text-sm">
					<span>
						<span class="text-on-surface font-mono">{formatNumber(totals.creations, locale)}</span>
						accounts
					</span>
					{#each CONTRIBUTION_KINDS.filter((kind) => totals.kinds[kind].contributions) as kind (kind)}
						<span class="flex items-center gap-1.5">
							<span class="size-2 rounded-sm" style:background={KIND_COLORS[kind]}></span>
							{kindLabel(kind)}
							<span class="text-on-surface font-mono">
								{formatNumber(totals.kinds[kind].contributions, locale)}
							</span>
							<span>· <KindBytes figures={totals.kinds[kind]} /></span>
						</span>
					{/each}
					{#if totals.creations_without_ram}
						<span>
							{kindLabel('none')}
							<span class="text-on-surface font-mono">
								{formatNumber(totals.creations_without_ram, locale)}
							</span>
						</span>
					{/if}
				</p>
				<WindowPills bind:value={statWindow} />
			</div>
		</Card>

		<Card title="Recently created accounts">
			{#if creations.length}
				<table class="w-full text-sm">
					<thead class="text-muted text-left">
						<tr class="border-outline border-b">
							<th class="py-2 font-normal">Account</th>
							<th class="py-2 font-normal">Created</th>
							<th class="py-2 font-normal">RAM arrived</th>
							<th class="py-2 text-right font-normal">Amount</th>
						</tr>
					</thead>
					<tbody>
						{#each creations as creation (creation.global_seq)}
							{@const kind = creationKind(creation)}
							<tr class="border-outline/50 border-b">
								<td class="py-2">
									<a class="text-primary" href={context.urlPath(`/account/${creation.account}`)}>
										{creation.account}
									</a>
								</td>
								<td class="text-muted py-2 text-xs whitespace-nowrap">
									{created(creation.block_time)}
								</td>
								<td class="py-2">
									<span
										class="mr-1.5 inline-block size-2 rounded-full"
										style:background={KIND_COLORS[kind]}
									></span>{kindLabel(kind)}
								</td>
								<td class="py-2 text-right">
									{#each creation.contributions as contribution (contribution.global_seq)}
										<div><ContributionBytes {contribution} /></div>
									{/each}
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			{:else if !listLoading && !listFailed}
				<p class="text-muted text-sm">This account has not created any accounts.</p>
			{/if}
			{#if listFailed}
				<p class="text-error text-sm">Created accounts are unavailable right now.</p>
			{:else if listLoading}
				<p class="text-muted animate-pulse text-sm">Loading accounts...</p>
			{:else if more}
				<Button variant="secondary" onclick={() => loadPage(false)}>Show older</Button>
			{/if}
		</Card>
	{/if}
</Stack>
