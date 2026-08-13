<script lang="ts">
	import type { NameType, Checksum256 } from '@wharfkit/antelope';
	import { Name, Asset } from '@wharfkit/antelope';
	import { getContext } from 'svelte';
	import type { UnicoveContext } from '$lib/state/client.svelte';
	import ThumbsUp from '@lucide/svelte/icons/thumbs-up';
	import ThumbsDown from '@lucide/svelte/icons/thumbs-down';
	import AssetText from '$lib/components/elements/asset.svelte';
	import { cn } from '$lib/utils';
	import { crossfade } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';

	type TopicProps = {
		type: 'topic';
		topicId: NameType;
		currentVote?: number | null;
		disabled?: boolean;
		onVoteSuccess?: (id?: Checksum256, voteType?: number | null) => void;
		onVoteFailure?: (error: string) => void;
	};

	type MsigProps = {
		type: 'msig';
		proposer: NameType;
		proposalName: NameType;
		currentVote?: number | null;
		disabled?: boolean;
		onVoteSuccess?: (id?: Checksum256, voteType?: number | null) => void;
		onVoteFailure?: (error: string) => void;
	};

	type Props = TopicProps | MsigProps;

	const props: Props = $props();
	const context = getContext<UnicoveContext>('state');

	let voting = $state(false);
	let error = $state<string | null>(null);

	const currentVote = $derived(props.currentVote ?? null);
	const disabled = $derived(props.disabled ?? false);

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

	let supports = $derived(currentVote === 1);
	let opposes = $derived(currentVote === 0);

	function handleSupport() {
		if (supports) {
			supports = false;
			handleRemoveVote();
		} else {
			supports = true;
			opposes = false;
			handleVote(1);
		}
	}

	function handleOppose() {
		if (opposes) {
			opposes = false;
			handleRemoveVote();
		} else {
			opposes = true;
			supports = false;
			handleVote(0);
		}
	}

	const [send, receive] = crossfade({
		duration: 300,
		easing: quintOut
	});

	const disabledStyles =
		'disabled:cursor-default disabled:bg-transparent disabled:text-on-surface transition-opacity disabled:opacity-50';

	const baseButtonStyles = 'grid size-12 shrink-0 cursor-pointer place-items-center rounded-full';
	const baseWrapperStyles =
		'flex items-center justify-between gap-2 rounded-xl px-4 py-2 border border-transparent';

	const itemType = $derived(props.type === 'topic' ? 'topic' : 'proposal');
</script>

<div class="@container grid gap-4">
	{#if error}
		<div class="bg-error-container text-on-error-container rounded p-3 text-sm">
			{error}
		</div>
	{/if}

	{#if context.wharf.session && context.account && votingWeight}
		<div class=" text-center">
			<p class="text-sm">
				{currentVote === null ? 'Voting' : 'Voted'}
				as <strong class="text-on-surface">{context.account.name}</strong> with weight
				<strong class="text-on-surface"><AssetText variant="full" value={votingWeight} /></strong>
			</p>
		</div>
	{/if}

	<div
		class="grid w-full max-w-sm grid-cols-1 grid-rows-1 justify-self-center *:col-start-1 *:row-start-1"
	>
		{#if supports}
			<div
				class={cn(
					baseWrapperStyles,
					'bg-success-container/60 dark:bg-success dark:text-on-success text-on-success-container '
				)}
				in:send={{ key: 'element' }}
				out:receive={{ key: 'element' }}
			>
				<button
					onclick={handleSupport}
					disabled={disabled || voting || !context.wharf.session}
					class={cn(
						baseButtonStyles,
						'hover:bg-success-container/80 bg-success-container text-on-success-container'
					)}
				>
					<ThumbsUp class={cn('size-6')} />
				</button>

				<span class="text-label-sm text-center leading-4 text-balance"
					>I support this {itemType}</span
				>

				<button
					onclick={handleOppose}
					disabled={disabled || voting || !context.wharf.session}
					class={cn('opacity-50 hover:bg-white/30 hover:opacity-100', baseButtonStyles)}
				>
					<ThumbsDown class={cn('size-6')} />
				</button>
			</div>
		{:else if opposes}
			<div
				class={cn(
					baseWrapperStyles,
					'bg-error-container/60 dark:bg-error text-on-error-container dark:text-on-error '
				)}
				in:send={{ key: 'element' }}
				out:receive={{ key: 'element' }}
			>
				<button
					onclick={handleSupport}
					disabled={disabled || voting || !context.wharf.session}
					class={cn('opacity-50 hover:bg-white/30 hover:opacity-100', baseButtonStyles)}
				>
					<ThumbsUp class={cn('size-6')} />
				</button>

				<span class="text-label-sm text-center leading-4 text-balance"
					>I oppose this {itemType}</span
				>

				<button
					onclick={handleOppose}
					disabled={disabled || voting || !context.wharf.session}
					class={cn(
						baseButtonStyles,
						'hover:bg-error-container/80 bg-error-container text-on-error-container '
					)}
				>
					<ThumbsDown class={cn('size-6')} />
				</button>
			</div>
		{:else}
			<div
				class={cn(baseWrapperStyles, 'border-outline')}
				in:send={{ key: 'element' }}
				out:receive={{ key: 'element' }}
			>
				<button
					onclick={handleSupport}
					disabled={disabled || voting || !context.wharf.session}
					class={cn(
						baseButtonStyles,
						disabledStyles,
						'hover:bg-surface-container hover:text-success '
					)}
				>
					<ThumbsUp class={cn('size-6')} />
				</button>

				{#if !context.wharf.session}
					<p class="text-on-surface-variant text-label text-center">Please log in to vote</p>
				{:else}
					<span class="text-label-sm text-center leading-4 text-balance">
						Do you support or oppose this {itemType}?
					</span>
				{/if}

				<button
					onclick={handleOppose}
					disabled={disabled || voting || !context.wharf.session}
					class={cn(
						baseButtonStyles,
						disabledStyles,
						'hover:bg-surface-container hover:text-error '
					)}
				>
					<ThumbsDown class={cn('size-6')} />
				</button>
			</div>
		{/if}
	</div>
</div>
