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

	interface Props {
		topicId: NameType;
		currentVote?: number | null;
		disabled?: boolean;
		onVoteSuccess?: (id?: Checksum256, voteType?: number | null) => void;
		onVoteFailure?: (error: string) => void;
	}

	const {
		topicId,
		currentVote = null,
		disabled = false,
		onVoteSuccess,
		onVoteFailure
	}: Props = $props();
	const context = getContext<UnicoveContext>('state');

	let voting = $state(false);
	let error = $state<string | null>(null);

	async function handleVote(voteType: number) {
		if (!context.wharf.session || !context.account) {
			alert('Please log in to vote');
			return;
		}

		voting = true;
		error = null;

		try {
			const voter = context.account.name;
			const topic_id = Name.from(topicId);

			let action;
			if (currentVote === null) {
				action = context.network.contracts.sentiment.action('vote', {
					voter,
					topic_id,
					vote_type: voteType
				});
			} else {
				action = context.network.contracts.sentiment.action('changevote', {
					voter,
					topic_id,
					vote_type: voteType
				});
			}

			const result = await context.wharf.transact({ action });

			if (onVoteSuccess) {
				onVoteSuccess(result.resolved?.transaction.id, voteType);
			}
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to vote';
			console.error('Vote error:', e);

			if (onVoteFailure) {
				onVoteFailure(error);
			}
		} finally {
			voting = false;
		}
	}

	async function handleRemoveVote() {
		if (!context.wharf.session || !context.account) {
			alert('Please log in to remove vote');
			return;
		}

		voting = true;
		error = null;

		try {
			const voter = context.account.name;
			const topic_id = Name.from(topicId);

			const action = context.network.contracts.sentiment.action('removevote', {
				voter,
				topic_id
			});

			const result = await context.wharf.transact({ action });

			if (onVoteSuccess) {
				onVoteSuccess(result.resolved?.transaction.id, null);
			}
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to remove vote';
			console.error('Remove vote error:', e);

			if (onVoteFailure) {
				onVoteFailure(error);
			}
		} finally {
			voting = false;
		}
	}

	const votingWeight = $derived.by(() => {
		if (!context.account || !context.account.voter) {
			return null;
		}
		const staked = context.account.voter.staked;
		const symbol = context.network.config.systemtoken.symbol;
		return Asset.fromUnits(staked, symbol);
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
				Voting as <strong class="text-on-surface">{context.account.name}</strong> with weight
				<strong class="text-on-surface"><AssetText variant="full" value={votingWeight} /></strong>
			</p>
		</div>
	{/if}

	<div class="grid grid-cols-1 grid-rows-1 *:col-start-1 *:row-start-1">
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

				<span class="text-label-sm">I support this topic</span>

				<button
					onclick={handleOppose}
					disabled={disabled || voting || !context.wharf.session}
					class={cn('hover:bg-white/30', baseButtonStyles)}
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
					class={cn('hover:bg-white/30', baseButtonStyles)}
				>
					<ThumbsUp class={cn('size-6')} />
				</button>

				<span class="text-label-sm">I oppose this topic</span>

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
						Do you support or oppose this topic?
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
