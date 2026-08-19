<script lang="ts">
	import type { NameType, Checksum256 } from '@wharfkit/antelope';
	import { Name, Asset } from '@wharfkit/antelope';
	import { getContext } from 'svelte';
	import type { UnicoveContext } from '$lib/state/client.svelte';
	import ThumbsUp from '@lucide/svelte/icons/thumbs-up';
	import ThumbsDown from '@lucide/svelte/icons/thumbs-down';
	import AssetText from '$lib/components/elements/asset.svelte';
	import { cn } from '$lib/utils';

	type TopicProps = {
		type: 'topic';
		topicId: NameType;
		currentVote?: number | null;
		disabled?: boolean;
		showVoter?: boolean;
		onVoteSuccess?: (id?: Checksum256, voteType?: number | null) => void;
		onVoteFailure?: (error: string) => void;
	};

	type MsigProps = {
		type: 'msig';
		proposer: NameType;
		proposalName: NameType;
		currentVote?: number | null;
		disabled?: boolean;
		showVoter?: boolean;
		onVoteSuccess?: (id?: Checksum256, voteType?: number | null) => void;
		onVoteFailure?: (error: string) => void;
	};

	type Props = TopicProps | MsigProps;

	const props: Props = $props();
	const context = getContext<UnicoveContext>('state');

	let voting = $state(false);
	let error = $state<string | null>(null);

	const disabled = $derived(props.disabled ?? false);
	const showVoter = $derived(props.showVoter ?? true);

	async function handleVote(voteType: number) {
		if (!context.wharf.session || !context.account) {
			return;
		}

		voting = true;
		error = null;

		try {
			const voter = context.account.name;
			let action;

			if (props.type === 'topic') {
				const topic_id = Name.from(props.topicId);

				action = context.network.contracts.sentiment.action('votetopic', {
					voter,
					topic_id,
					vote_type: voteType
				});
			} else {
				const proposerName = Name.from(props.proposer);
				const proposal_name = Name.from(props.proposalName);

				action = context.network.contracts.sentiment.action('votemsig', {
					voter,
					proposer: proposerName,
					proposal_name,
					vote_type: voteType
				});
			}

			const result = await context.wharf.transact({ action });

			if (props.onVoteSuccess) {
				props.onVoteSuccess(result.resolved?.transaction.id, voteType);
			}
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to vote';
			console.error('Vote error:', e);

			if (props.onVoteFailure) {
				props.onVoteFailure(error);
			}
		} finally {
			voting = false;
		}
	}

	async function handleRemoveVote() {
		if (!context.wharf.session || !context.account) {
			return;
		}

		voting = true;
		error = null;

		try {
			const voter = context.account.name;
			let action;

			if (props.type === 'topic') {
				const topic_id = Name.from(props.topicId);

				action = context.network.contracts.sentiment.action('rmtopicvote', {
					voter,
					topic_id
				});
			} else {
				const proposerName = Name.from(props.proposer);
				const proposal_name = Name.from(props.proposalName);

				action = context.network.contracts.sentiment.action('rmmsigvote', {
					voter,
					proposer: proposerName,
					proposal_name
				});
			}

			const result = await context.wharf.transact({ action });

			if (props.onVoteSuccess) {
				props.onVoteSuccess(result.resolved?.transaction.id, null);
			}
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to remove vote';
			console.error('Remove vote error:', e);

			if (props.onVoteFailure) {
				props.onVoteFailure(error);
			}
		} finally {
			voting = false;
		}
	}

	let votingWeight = $state<Asset | null>(null);
	$effect(() => {
		const account = context.account;
		if (!account || !showVoter) {
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

	const pending = $derived(props.currentVote === undefined);
	const vote = $derived(props.currentVote ?? null);
	const supports = $derived(vote === 1);
	const opposes = $derived(vote === 0);
	const signedIn = $derived(Boolean(context.wharf.session && context.account));
	const canAct = $derived(signedIn && !disabled && !voting);

	const choiceBase =
		'flex flex-1 flex-col items-center gap-1.5 rounded-lg border border-transparent px-3 py-3 text-label-sm transition-colors';
	const frame = 'flex gap-2 rounded-xl border border-outline p-2';
</script>

<div class="grid gap-3">
	{#if error}
		<div class="bg-error-container text-on-error-container rounded p-3 text-sm">
			<strong class="block">Your vote was not recorded</strong>
			{error}
		</div>
	{/if}

	{#if !signedIn}
		<div class="border-outline text-muted rounded-xl border border-dashed p-4 text-center text-sm">
			Connect a wallet to add your voice. Results stay visible either way.
		</div>
	{:else if pending}
		<div class={frame} aria-hidden="true">
			<div class="bg-surface-container h-16 flex-1 animate-pulse rounded-lg"></div>
			<div class="bg-surface-container h-16 flex-1 animate-pulse rounded-lg"></div>
		</div>
	{:else if voting}
		<div class="border-outline rounded-xl border p-6 text-center">
			<p class="text-muted text-sm">Waiting for your wallet to sign</p>
		</div>
	{:else}
		<div class={frame}>
			<button
				onclick={() => !supports && handleVote(1)}
				disabled={!canAct || supports}
				class={cn(
					choiceBase,
					supports
						? 'bg-success-container text-on-success-container border-success'
						: 'hover:bg-surface-container hover:text-success cursor-pointer'
				)}
			>
				<ThumbsUp class="size-5" />
				Support
			</button>
			<button
				onclick={() => !opposes && handleVote(0)}
				disabled={!canAct || opposes}
				class={cn(
					choiceBase,
					opposes
						? 'bg-error-container text-on-error-container border-error'
						: 'hover:bg-surface-container hover:text-error cursor-pointer'
				)}
			>
				<ThumbsDown class="size-5" />
				Oppose
			</button>
		</div>

		<div class="flex flex-wrap items-center justify-between gap-2 text-sm">
			<p class="text-muted">
				{#if vote === null}
					{#if showVoter && votingWeight}
						Your weight: <AssetText variant="full" value={votingWeight} />
					{/if}
				{:else if showVoter && votingWeight}
					{supports ? 'You supported' : 'You opposed'} with
					<AssetText variant="full" value={votingWeight} />
				{:else}
					{supports ? 'You supported' : 'You opposed'}
				{/if}
			</p>
			{#if vote !== null}
				<button
					onclick={handleRemoveVote}
					disabled={!canAct}
					class="text-primary cursor-pointer hover:underline"
				>
					Remove vote
				</button>
			{/if}
		</div>
	{/if}
</div>
