<script lang="ts">
	import { getContext } from 'svelte';
	import { Card, Chip } from 'unicove-components';
	import type { UnicoveContext } from '$lib/state/client.svelte';
	import AccountLink from '$lib/components/elements/account.svelte';
	import type { ApiResponse, MsigDetailData } from '$lib/types/sentiment';
	import type { VpMsigCardModel } from '$lib/vp/onchain';

	interface Props {
		model: VpMsigCardModel;
	}

	const { model }: Props = $props();
	const context = getContext<UnicoveContext>('state');

	let approved = $state<number | null>(null);
	let total = $state<number | null>(null);
	let unavailable = $state(false);
	let sentimentVotes = $state<number | null>(null);

	const sentimentEnabled = $derived(context.network.supports('sentiment'));

	$effect(() => {
		if (!model.live) {
			return;
		}
		const controller = new AbortController();
		fetch(context.urlPath(`/api/msig/${model.proposer}/${model.proposal}`), {
			signal: controller.signal
		})
			.then((response) => response.json())
			.then((json) => {
				if (json && !('error' in json) && Array.isArray(json.provided_approvals)) {
					const provided = json.provided_approvals.length;
					const requested = Array.isArray(json.requested_approvals)
						? json.requested_approvals.length
						: 0;
					approved = provided;
					total = provided + requested;
				} else {
					unavailable = true;
				}
			})
			.catch(() => {
				unavailable = true;
			});
		return () => controller.abort();
	});

	$effect(() => {
		if (!model.live || !sentimentEnabled) {
			return;
		}
		const controller = new AbortController();
		fetch(context.urlPath(`/api/sentiment/msigs/${model.proposer}/${model.proposal}`), {
			signal: controller.signal
		})
			.then((response) => response.json())
			.then((result: ApiResponse<MsigDetailData>) => {
				if (result.success && result.data) {
					sentimentVotes = result.data.statistics.totalVotes;
				}
			})
			.catch(() => {});
		return () => controller.abort();
	});
</script>

<Card>
	<h3 class="text-label-sm text-muted">Multisig proposal</h3>
	<div class="flex flex-wrap items-center justify-between gap-2">
		<a class="text-primary font-medium hover:underline" href={context.urlPath(model.msigPath)}>
			{model.proposer}/{model.proposal}
		</a>
		<Chip>
			{#if model.status === 'active'}
				Active
			{:else if model.status === 'executed'}
				Executed
			{:else if model.status === 'expired'}
				Expired
			{:else}
				Cancelled
			{/if}
		</Chip>
	</div>
	<div class="text-muted text-sm">
		Proposed by <AccountLink name={model.proposer} />
	</div>
	{#if model.live}
		{#if approved !== null && total !== null}
			<div class="text-sm">{approved} of {total} approvals signed</div>
		{:else if unavailable}
			<div class="text-muted text-sm">No live approval data on this network.</div>
		{/if}
	{/if}
	{#if model.txPath}
		<a class="text-primary text-sm hover:underline" href={context.urlPath(model.txPath)}>
			View the executed transaction
		</a>
	{/if}
	<div class="flex flex-wrap gap-4">
		<a class="text-primary text-sm hover:underline" href={context.urlPath(model.msigPath)}>
			View the multisig
		</a>
		{#if sentimentEnabled}
			<a
				class="text-primary text-sm hover:underline"
				href={context.urlPath(`${model.msigPath}/sentiment`)}
			>
				{#if sentimentVotes !== null}
					Sentiment ({sentimentVotes})
				{:else}
					Sentiment
				{/if}
			</a>
		{/if}
	</div>
</Card>
