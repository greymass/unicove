<script lang="ts">
	import { getContext } from 'svelte';
	import { Button, Card } from 'unicove-components';
	import { Asset, Name } from '@wharfkit/antelope';
	import type { UnicoveContext } from '$lib/state/client.svelte';
	import AssetText from '$lib/components/elements/asset.svelte';
	import { vpActionKey, vpActionModels, type VpActionModel } from '$lib/vp/actions';
	import type { VpSummary } from '$lib/vp/types';
	import VpActionMsigRow from './VpActionMsigRow.svelte';
	import VpActionSentimentRow from './VpActionSentimentRow.svelte';

	interface Props {
		summary: VpSummary;
	}

	const { summary }: Props = $props();
	const context = getContext<UnicoveContext>('state');

	const sentimentEnabled = $derived(context.network.supports('sentiment'));
	const models = $derived(
		vpActionModels(summary).filter((model) => sentimentEnabled || model.kind === 'msig-link')
	);

	let votes = $state<Record<string, number | null>>({});
	let votingWeight = $state<Asset | null>(null);

	$effect(() => {
		const account = context.account;
		if (!account) {
			votingWeight = null;
			return;
		}
		(async () => {
			try {
				const result = await context.network.contracts.sentiment.readonly('getmetric', {
					voter: account.name
				});
				const units = Number(result.system_staked) + Number(result.system_liquid);
				votingWeight = Asset.fromUnits(units, context.network.config.systemtoken.symbol);
			} catch {
				votingWeight = null;
			}
		})();
	});

	$effect(() => {
		const account = context.account;
		if (!account) {
			votes = {};
			return;
		}
		const voter = account.name;
		for (const model of models) {
			loadVote(voter, model);
		}
	});

	async function loadVote(voter: Name, model: VpActionModel) {
		const key = vpActionKey(model);
		try {
			if (model.kind === 'sentiment-topic') {
				const result = await context.network.contracts.sentiment.readonly('getvote', {
					voter,
					topic_id: Name.from(model.topic)
				});
				votes[key] = result ? Number(result.vote_type) : null;
			} else if (model.kind === 'sentiment-msig') {
				const result = await context.network.contracts.sentiment.readonly('getmsigvote', {
					voter,
					proposer: Name.from(model.proposer),
					proposal_name: Name.from(model.proposal)
				});
				votes[key] = result ? Number(result.vote_type) : null;
			}
		} catch {
			votes[key] = null;
		}
	}
</script>

<Card>
	{#if models.length === 0}
		<p class="text-muted text-sm">
			Sentiment voting and multisig approval become available when this proposal has on-chain
			records.
		</p>
	{:else if context.wharf.session && context.account}
		<div class="flex flex-wrap items-center justify-between gap-2">
			<h2 class="text-label-sm text-muted">Your participation</h2>
			<p class="text-sm">
				Acting as <strong class="text-on-surface">{context.account.name}</strong>
				{#if votingWeight}
					with weight
					<strong class="text-on-surface"><AssetText variant="full" value={votingWeight} /></strong>
				{/if}
			</p>
		</div>
		<div class="grid gap-4 md:grid-cols-2">
			{#each models as model (vpActionKey(model))}
				{#if model.kind === 'msig-link'}
					<VpActionMsigRow {model} />
				{:else}
					<VpActionSentimentRow
						{model}
						currentVote={votes[vpActionKey(model)] ?? null}
						onVoted={(voteType) => (votes[vpActionKey(model)] = voteType)}
					/>
				{/if}
			{/each}
		</div>
	{:else}
		<div class="flex flex-wrap items-center justify-between gap-2">
			<h2 class="text-label-sm text-muted">Your participation</h2>
			<Button onclick={() => context.wharf?.login()}>Connect Wallet</Button>
		</div>
		<div class="grid gap-4 md:grid-cols-2">
			{#each models as model (vpActionKey(model))}
				{#if model.kind === 'msig-link'}
					<VpActionMsigRow {model} />
				{:else}
					<VpActionSentimentRow {model} currentVote={null} onVoted={() => {}} />
				{/if}
			{/each}
		</div>
	{/if}
</Card>
