<script lang="ts">
	import { getContext } from 'svelte';
	import { Button, Card, Stack } from '@wharfkit/svelte-components';
	import { Gift } from '@lucide/svelte';
	import type { UnicoveContext } from '$lib/state/client.svelte';
	import { CreationindexClient } from '$lib/state/creationindex/client';
	import { GiftProgram } from '$lib/state/creationindex/giftprogram.svelte';
	import { OBSERVED_DAYS } from '$lib/state/creationindex/onboarding';
	import { giftcontract } from '$lib/wharf/chains';
	import { formatBytes } from '$lib/utils/bytes';
	import { formatNumber } from '$lib/utils/intl';
	import { runwayText } from './labels.svelte';

	const context = getContext<UnicoveContext>('state');
	const locale = $derived(context.settings.data.locale);
	const program = new GiftProgram(
		String(giftcontract ?? ''),
		new CreationindexClient(context.urlPath('/api/creationindex')),
		context.network.client
	);
	program.load();

	const observed = $derived(program.observed);
	const committed = $derived(program.committed);
	const endowment = $derived(program.endowment);
</script>

<Card>
	<div class="grid grid-rows-[auto_1fr] gap-6 lg:grid-flow-col lg:grid-cols-2">
		<Stack>
			<div class="flex items-center gap-3">
				<picture class="bg-surface-container-high grid size-12 place-items-center rounded-full">
					<Gift />
				</picture>
				<hgroup>
					<h2 class="text-title">Network-funded onboarding</h2>
					{#if program.exists && !program.loading}
						<p class="text-muted text-label-sm mt-1">
							{#if program.creators.length === 1}
								1 creator,
							{:else}
								{formatNumber(program.creators.length, locale)} creators,
							{/if}
							{#if program.enabled}enabled{:else}disabled{/if}
						</p>
					{/if}
				</hgroup>
			</div>
			<p class="max-w-md text-pretty">
				Registered creators gift RAM from a network endowment to each account they create, under
				daily quotas producers set by msig.
			</p>
		</Stack>

		<Button
			class="order-last lg:order-none lg:justify-self-start"
			variant="primary"
			href={context.urlPath('/onboarding')}>View onboarding</Button
		>

		<Stack class="mt-2 gap-5 lg:row-span-2">
			{#if program.loading}
				{#each [0, 1, 2] as i (i)}
					<span class="bg-surface-container block h-12 w-full animate-pulse rounded-xl"></span>
				{/each}
			{:else if program.failed}
				<p class="text-muted text-sm">Program figures are unavailable right now.</p>
			{:else if !program.exists}
				<div class="border-outline grid gap-1 rounded-xl border border-dashed p-4">
					<h3 class="text-label">Endowment</h3>
					<p class="text-muted text-sm text-pretty">
						Figures appear here once VP-0001 creates <span class="font-mono"
							>{program.contract}</span
						>
						and seeds it with RAM.
					</p>
				</div>
			{:else}
				<div class="grid gap-2">
					<div class="flex items-baseline justify-between gap-3">
						<h3 class="text-label">Endowment</h3>
						<span class="text-muted text-label-sm">
							{formatNumber(observed.gifts, locale)} gifts in {OBSERVED_DAYS} days
						</span>
					</div>
					<p class="text-headline font-mono tabular-nums">{formatBytes(program.available)}</p>
					{#if endowment && endowment.ram_quota > 0}
						<div class="bg-surface-container-high h-1.5 overflow-hidden rounded-full">
							<div
								class="bg-primary h-full rounded-full"
								style:width="{(endowment.available_bytes / endowment.ram_quota) * 100}%"
							></div>
						</div>
						<p class="text-muted text-label-sm">
							available of {formatBytes(endowment.ram_quota)} held
						</p>
					{/if}
				</div>

				<div class="grid grid-cols-2 gap-3">
					<div class="bg-surface-container grid gap-0.5 rounded-xl p-3">
						<span class="text-muted text-label-sm">Observed runway</span>
						<span class="text-title">{runwayText(observed.runway, locale)}</span>
						<span class="text-muted text-xs">at the last {OBSERVED_DAYS} days' pace</span>
					</div>
					<div class="bg-surface-container grid gap-0.5 rounded-xl p-3">
						<span class="text-muted text-label-sm">Committed runway</span>
						<span class="text-title">
							{#if committed.disabled}
								Program disabled
							{:else if committed.runway === null}
								No active quota
							{:else}
								{runwayText(committed.runway, locale)}
							{/if}
						</span>
						{#if committed.suspendedQuota}
							<span class="text-error text-xs">
								{formatBytes(committed.suspendedQuota)} quota suspended
							</span>
						{:else}
							<span class="text-muted text-xs">if every quota is used daily</span>
						{/if}
					</div>
				</div>
			{/if}
		</Stack>
	</div>
</Card>
