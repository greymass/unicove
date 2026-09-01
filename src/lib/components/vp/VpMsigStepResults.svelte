<script lang="ts">
	import { getContext } from 'svelte';
	import { Name, type Checksum256 } from '@wharfkit/antelope';
	import type { UnicoveContext } from '$lib/state/client.svelte';
	import ApprovalProgress from '$lib/components/msig/approvalprogress.svelte';
	import SentimentMeter from '$lib/components/sentiment/SentimentMeter.svelte';
	import VoteButtons from '$lib/components/sentiment/voteButtons.svelte';
	import { percentString } from '$lib/utils';
	import { vpApplyOwnVote, vpStepHasPoll, type VpStepTally } from '$lib/vp/sentiment';
	import type { VpMsigApprovals, VpMsigStep } from '$lib/vp/onchain';
	import type { ApiResponse, MsigDetailData, TopicStatistics } from '$lib/types/sentiment';

	interface Props {
		step: VpMsigStep;
		approvals: VpMsigApprovals | null;
	}

	const { step, approvals }: Props = $props();
	const context = getContext<UnicoveContext>('state');

	const locale = $derived(context.settings.data.locale);
	const symbol = $derived(context.network.chain.systemToken?.symbol.name ?? null);
	const hasPoll = $derived(context.network.supports('sentiment') && vpStepHasPoll(step));

	let statistics = $state<TopicStatistics | null>(null);
	let loaded = $state(false);
	let currentVote = $state<number | null | undefined>(undefined);
	let tally = $state<VpStepTally | null>(null);
	let ownWeight = $state<number | null>(null);
	let voteGeneration = 0;
	let baseVote: number | null | undefined;

	const loadStatistics = (signal?: AbortSignal) =>
		fetch(context.urlPath(`/api/sentiment/msigs/${step.proposer}/${step.proposal}`), { signal })
			.then((response) => response.json())
			.then((result: ApiResponse<MsigDetailData>) => {
				if (result.success && result.data) statistics = result.data.statistics;
				loaded = true;
			})
			.catch((error) => {
				if (error?.name === 'AbortError') return;
				loaded = true;
			});

	$effect(() => {
		if (!hasPoll) return;
		statistics = null;
		tally = null;
		baseVote = undefined;
		loaded = false;
		const controller = new AbortController();
		loadStatistics(controller.signal);
		return () => controller.abort();
	});

	$effect(() => {
		const account = context.account;
		const generation = ++voteGeneration;
		if (!hasPoll || !step.live || !account) {
			currentVote = null;
			return;
		}
		currentVote = undefined;
		const loadVote = async () => {
			try {
				const result = await context.network.contracts.sentiment.readonly('getmsigvote', {
					voter: account.name,
					proposer: Name.from(step.proposer!),
					proposal_name: Name.from(step.proposal!)
				});
				if (generation !== voteGeneration) return;
				currentVote = result ? Number(result.vote_type) : null;
			} catch {
				if (generation !== voteGeneration) return;
				currentVote = null;
			}
		};
		loadVote();
		return () => {
			voteGeneration++;
		};
	});

	$effect(() => {
		const account = context.account;
		if (!hasPoll || !step.live || !account) {
			ownWeight = null;
			return;
		}
		let active = true;
		(async () => {
			try {
				const result = await context.network.contracts.sentiment.readonly('getmetric', {
					voter: account.name
				});
				if (active) ownWeight = Number(result.system_staked) + Number(result.system_liquid);
			} catch {
				if (active) ownWeight = null;
			}
		})();
		return () => {
			active = false;
		};
	});

	const displayed = $derived<VpStepTally | null>(
		tally ??
			(statistics
				? {
						totalVotes: statistics.totalVotes,
						supportPercentage: statistics.supportPercentage,
						oppositionPercentage: statistics.oppositionPercentage
					}
				: null)
	);

	const onVoteSuccess = (_id?: Checksum256, voteType?: number | null) => {
		const next = voteType ?? null;
		if (baseVote === undefined) baseVote = currentVote ?? null;
		voteGeneration++;
		currentVote = next;
		if (statistics && ownWeight !== null) {
			tally = vpApplyOwnVote(statistics, baseVote, next, ownWeight);
		} else {
			loadStatistics();
		}
	};
</script>

{#if approvals || hasPoll}
	<div class="mt-4 grid gap-3">
		{#if approvals}
			<div
				class="flex items-start gap-3"
				role="group"
				aria-labelledby="vp-step-signers-{step.proposer}-{step.proposal}"
			>
				<span
					id="vp-step-signers-{step.proposer}-{step.proposal}"
					class="text-muted text-label-sm w-16 shrink-0 pt-1">Signers</span
				>
				<div class="min-w-0 flex-1">
					<ApprovalProgress
						approved={approvals.approved}
						requested={approvals.requested}
						satisfied={approvals.satisfied}
						threshold={approvals.threshold}
						possible={approvals.possible}
					/>
				</div>
			</div>
		{/if}

		{#if hasPoll}
			<div
				class="flex items-start gap-3"
				role="group"
				aria-labelledby="vp-step-holders-{step.proposer}-{step.proposal}"
			>
				<span
					id="vp-step-holders-{step.proposer}-{step.proposal}"
					class="text-muted text-label-sm w-16 shrink-0 pt-1">Holders</span
				>
				<div class="min-w-0 flex-1">
					{#if displayed && displayed.totalVotes > 0}
						<p>
							<span class="text-headline-sm">
								{percentString(locale, displayed.supportPercentage / 100, 0)}
							</span>
							<span class="text-muted text-sm">
								{#if symbol}support by {symbol} weight{:else}support{/if} ·
								{#if displayed.totalVotes === 1}
									1 vote
								{:else}
									{displayed.totalVotes} votes
								{/if}
							</span>
						</p>
						<div class="mt-2">
							<SentimentMeter
								id="vp-step-{step.proposer}-{step.proposal}"
								compact
								statistics={displayed}
							/>
						</div>
					{:else if loaded}
						<p class="text-muted text-sm">No votes yet on this step.</p>
					{:else}
						<div class="bg-surface-container h-4 w-40 animate-pulse rounded"></div>
					{/if}
				</div>
				{#if step.live}
					<VoteButtons
						compact
						type="msig"
						proposer={step.proposer!}
						proposalName={step.proposal!}
						{currentVote}
						{onVoteSuccess}
					/>
				{/if}
			</div>
		{/if}
	</div>
{/if}
