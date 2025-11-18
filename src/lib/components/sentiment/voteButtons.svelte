<script lang="ts">
	import { Button } from 'unicove-components';
	import type { NameType, Checksum256 } from '@wharfkit/antelope';
	import { Name, Asset } from '@wharfkit/antelope';
	import { getContext } from 'svelte';
	import type { UnicoveContext } from '$lib/state/client.svelte';
	import ThumbsUp from '@lucide/svelte/icons/thumbs-up';
	import ThumbsDown from '@lucide/svelte/icons/thumbs-down';
	import X from '@lucide/svelte/icons/x';
	import AssetText from '$lib/components/elements/asset.svelte';

	interface Props {
		topicId: NameType;
		currentVote?: number | null;
		disabled?: boolean;
		onVoteSuccess?: (id?: Checksum256, voteType?: number | null) => void;
		onVoteFailure?: (error: string) => void;
		showOnlyRemove?: boolean;
	}

	const {
		topicId,
		currentVote = null,
		disabled = false,
		onVoteSuccess,
		onVoteFailure,
		showOnlyRemove = false
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
</script>

{#if showOnlyRemove}
	{#if currentVote !== null}
		<Button
			variant="text"
			disabled={disabled || voting || !context.wharf.session}
			onclick={handleRemoveVote}
			class={currentVote === 1
				? 'text-success hover:text-success/80'
				: 'text-error hover:text-error/80'}
		>
			<span class="flex items-center gap-1.5">
				<X class="size-4" />
				<span class="text-sm">Remove</span>
			</span>
		</Button>
	{/if}
{:else}
	<div class="flex flex-col gap-3">
		{#if error}
			<div class="bg-error-container text-on-error-container rounded p-3 text-sm">
				{error}
			</div>
		{/if}

		{#if context.wharf.session && context.account && votingWeight}
			<div class="text-on-surface-variant bg-surface-container rounded-lg px-4 py-3 text-center">
				<p class="text-sm">
					Voting as <strong class="text-on-surface">{context.account.name}</strong> with weight
					<strong class="text-on-surface"><AssetText variant="full" value={votingWeight} /></strong>
				</p>
			</div>
		{/if}

		<div class="flex gap-2">
			<Button
				class="flex-1 {voting ? 'opacity-70' : ''}"
				variant="secondary"
				disabled={disabled || voting || !context.wharf.session || currentVote === 1}
				onclick={() => handleVote(1)}
			>
				<span class="flex items-center gap-2">
					<ThumbsUp class="size-4" />
					<span>{currentVote === 1 ? 'Supporting' : 'Support'}</span>
				</span>
			</Button>

			<Button
				class="flex-1 {voting ? 'opacity-70' : ''}"
				variant="secondary"
				disabled={disabled || voting || !context.wharf.session || currentVote === 0}
				onclick={() => handleVote(0)}
			>
				<span class="flex items-center gap-2">
					<ThumbsDown class="size-4" />
					<span>{currentVote === 0 ? 'Opposing' : 'Oppose'}</span>
				</span>
			</Button>
		</div>

		{#if !context.wharf.session}
			<p class="text-on-surface-variant text-center text-sm">Please log in to vote</p>
		{/if}
	</div>
{/if}
