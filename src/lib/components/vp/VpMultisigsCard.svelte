<script lang="ts">
	import { getContext } from 'svelte';
	import { Card } from 'unicove-components';
	import type { UnicoveContext } from '$lib/state/client.svelte';
	import { parseMsigApprovals, vpMsigSteps } from '$lib/vp/onchain';
	import type { VpSummary } from '$lib/vp/types';

	interface Props {
		summary: VpSummary;
		basePath: string;
	}

	const { summary, basePath }: Props = $props();
	const context = getContext<UnicoveContext>('state');

	const locale = $derived(context.settings.data.locale);
	const steps = $derived(vpMsigSteps(summary, locale));
	const live = $derived(steps.find((s) => s.live) ?? null);
	const closed = $derived(steps.filter((s) => !s.live && !s.planned).length);
	const planned = $derived(steps.filter((s) => s.planned).length);

	let approved = $state<number | null>(null);
	let requested = $state<number | null>(null);

	$effect(() => {
		const step = live;
		if (!step?.proposer || !step?.proposal) return;
		const controller = new AbortController();
		fetch(context.urlPath(`/api/msig/${step.proposer}/${step.proposal}`), {
			signal: controller.signal
		})
			.then((response) => response.json())
			.then((json) => {
				const msig = parseMsigApprovals(json);
				if (!msig) return;
				approved = msig.approved;
				requested = msig.requested;
			})
			.catch(() => {});
		return () => controller.abort();
	});
</script>

<Card class="hover:bg-surface-container-high p-0 transition-colors">
	<a href="{basePath}/multisigs" class="block p-4">
		<div class="flex items-baseline justify-between gap-2">
			<h2 class="text-title">Multisigs</h2>
			{#if live}
				<span class="text-primary text-label-sm">Awaiting signatures</span>
			{/if}
		</div>

		{#if live && approved !== null && requested !== null}
			<div class="mt-3 flex items-end justify-between gap-3">
				<div>
					<span class="text-headline">{approved}</span><span class="text-muted text-sm">
						/ {requested}</span
					>
					<p class="text-muted text-sm">approvals signed</p>
				</div>
				{#if closed}
					<div class="text-right">
						<span class="text-title">{closed}</span>
						<p class="text-muted text-sm">closed</p>
					</div>
				{/if}
			</div>
			<div class="bg-surface-container-high mt-3 h-2 overflow-hidden rounded-full">
				<div
					class="bg-primary h-full"
					style="width: {requested ? Math.round((approved / requested) * 100) : 0}%"
				></div>
			</div>
		{:else if live}
			<p class="text-muted mt-3 text-sm">One multisig is open for signatures.</p>
		{:else if planned}
			<p class="text-muted mt-3 text-sm">No step has been proposed on-chain yet.</p>
		{:else}
			<p class="text-muted mt-3 text-sm">No multisig is open for signatures.</p>
		{/if}

		<p class="text-primary border-outline mt-4 border-t pt-3 text-sm font-medium">
			View all {steps.length} multisigs
		</p>
	</a>
</Card>
