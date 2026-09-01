<script lang="ts">
	import { getContext } from 'svelte';
	import { page } from '$app/state';
	import { Card, Chip } from 'unicove-components';
	import { formatDateTime } from '$lib/utils/intl';
	import type { UnicoveContext } from '$lib/state/client.svelte';
	import VpMsigStepResults from '$lib/components/vp/VpMsigStepResults.svelte';
	import { parseMsigApprovals, type VpMsigApprovals, type VpMsigStep } from '$lib/vp/onchain';

	interface Props {
		step: VpMsigStep;
		basePath: string;
		last: boolean;
	}

	const { step, basePath, last }: Props = $props();
	const context = getContext<UnicoveContext>('state');

	let approvals = $state<VpMsigApprovals | null>(null);
	let unavailable = $state(false);

	const locale = $derived(page.params.locale ?? 'en');
	// Chain timestamps arrive without a zone marker but are UTC.
	const formatExpiration = (value: string) =>
		formatDateTime(new Date(/[Zz+]/.test(value) ? value : `${value}Z`), locale, {
			dateStyle: 'medium',
			timeStyle: 'short'
		});

	const statusLabels: Record<string, string> = {
		planned: 'Planned',
		active: 'Open for signatures',
		executed: 'Executed',
		expired: 'Expired',
		cancelled: 'Cancelled'
	};

	const statusVariants: Record<string, string> = {
		planned: 'opacity-60',
		active: 'bg-primary-container text-on-primary-container',
		executed: 'bg-success-container text-on-success-container',
		expired: 'bg-error-container text-on-error-container',
		cancelled: 'bg-error-container text-on-error-container'
	};

	$effect(() => {
		if (!step.proposer || !step.proposal) return;
		const controller = new AbortController();
		fetch(context.urlPath(`/api/msig/${step.proposer}/${step.proposal}`), {
			signal: controller.signal
		})
			.then((response) => response.json())
			.then((json) => {
				const msig = parseMsigApprovals(json);
				if (!msig) {
					unavailable = true;
					return;
				}
				approvals = msig;
			})
			.catch(() => {
				unavailable = true;
			});
		return () => controller.abort();
	});
</script>

<div class="relative pl-12" class:pb-6={!last}>
	{#if !last}
		<span class="bg-outline absolute top-10 bottom-0 left-[17px] w-0.5"></span>
	{/if}
	<span
		class="absolute top-0 left-0 grid size-9 place-items-center rounded-full border-2 text-sm font-semibold"
		class:border-primary={step.live}
		class:text-primary={step.live}
		class:border-outline={!step.live}
		class:text-muted={!step.live}
	>
		{step.step}
	</span>

	<Card class={step.live ? 'ring-primary ring-1' : undefined}>
		<div class="flex flex-wrap items-start justify-between gap-2">
			<div class="min-w-0">
				{#if step.title}
					<h2 class="text-title">{step.title}</h2>
				{:else}
					<h2 class="text-title">Step {step.step}</h2>
				{/if}
				{#if step.proposer && step.proposal}
					<p class="text-muted mt-1 font-mono text-sm">{step.proposer}/{step.proposal}</p>
				{:else if !step.title}
					<p class="text-muted mt-1 text-sm">This step has not been proposed on-chain yet.</p>
				{/if}
				{#if step.supersededAttempts === 1}
					<p class="text-muted mt-1 text-sm">Supersedes 1 earlier attempt.</p>
				{:else if step.supersededAttempts > 1}
					<p class="text-muted mt-1 text-sm">
						Supersedes {step.supersededAttempts} earlier attempts.
					</p>
				{/if}
			</div>
			<Chip class="shrink-0 whitespace-nowrap {statusVariants[step.status] ?? ''}"
				>{statusLabels[step.status]}</Chip
			>
		</div>

		{#if approvals?.actions.length}
			<div class="mt-3 flex flex-wrap gap-1.5">
				{#each approvals.actions as action (action)}
					<span class="bg-surface-container-high text-muted rounded px-2 py-0.5 font-mono text-xs">
						{action}
					</span>
				{/each}
			</div>
		{/if}

		<VpMsigStepResults {step} {approvals} />

		{#if approvals?.expiration}
			<p class="text-muted mt-2 text-sm">
				{step.live ? 'Expires' : 'Expired'}
				{formatExpiration(approvals.expiration)}
			</p>
		{:else if step.live && unavailable}
			<p class="text-muted mt-3 text-sm">No live approval data on this network.</p>
		{/if}

		<div class="mt-4 flex flex-wrap gap-2">
			{#if step.msigPath}
				<a
					class="bg-primary text-on-primary rounded-lg px-4 py-2 text-sm font-semibold"
					href={context.urlPath(step.msigPath)}
				>
					Open the multisig
				</a>
			{/if}
			{#if step.txPath}
				<a
					class="border-outline text-primary rounded-lg border px-4 py-2 text-sm font-semibold"
					href={context.urlPath(step.txPath)}
				>
					View the transaction
				</a>
			{/if}
			{#if context.network.supports('discussion') && step.proposer && step.proposal}
				<a
					class="border-outline text-primary rounded-lg border px-4 py-2 text-sm font-semibold"
					href="{basePath}/discussion?target=msig:{step.proposer}:{step.proposal}"
				>
					Read the discussion
				</a>
			{/if}
		</div>
	</Card>
</div>
