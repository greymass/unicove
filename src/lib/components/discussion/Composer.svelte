<script lang="ts">
	import { getContext } from 'svelte';
	import { Button } from 'unicove-components';
	import ThumbsUp from '@lucide/svelte/icons/thumbs-up';
	import ThumbsDown from '@lucide/svelte/icons/thumbs-down';
	import AssetText from '$lib/components/elements/asset.svelte';
	import Link from '$lib/components/elements/link.svelte';
	import type { UnicoveContext } from '$lib/state/client.svelte';
	import type { PostAbility } from '$lib/msg/gate';
	import { MAX_BODY_BYTES, checkBody, estimateNetBytes, normalizeBody } from '$lib/msg/model';
	import { approxCharsFromBytes } from '$lib/utils/bytes';
	import type { TargetDescriptor } from '$lib/discussion/targets';

	interface Props {
		signedIn: boolean;
		ability: PostAbility | null;
		netAvailable: number | null;
		vote: number | null;
		showChips: boolean;
		target: TargetDescriptor | null;
		onpost: (body: string) => Promise<void>;
	}

	const { signedIn, ability, netAvailable, vote, showChips, target, onpost }: Props = $props();
	const context = getContext<UnicoveContext>('state');
	const accountName = $derived(context.account ? String(context.account.name) : null);

	let body = $state('');
	let signing = $state(false);
	let postError = $state<string | null>(null);

	const normalized = $derived(normalizeBody(body));
	const check = $derived(checkBody(normalized));
	const bytes = $derived(check.bytes);
	const netEstimate = $derived(estimateNetBytes(bytes + 40));
	const netShort = $derived(netAvailable !== null && netEstimate > netAvailable);
	const ready = $derived(check.ok && !signing && !netShort && target !== null && target.postable);

	const remainingBytes = $derived(MAX_BODY_BYTES - bytes);
	const charsLeft = $derived(approxCharsFromBytes(remainingBytes, normalized.length, bytes));
	const charsOver = $derived(
		approxCharsFromBytes(bytes - MAX_BODY_BYTES, normalized.length, bytes)
	);
	const netShortChars = $derived(
		netAvailable !== null
			? approxCharsFromBytes(
					Math.ceil(((netEstimate - netAvailable) * 3) / 4),
					normalized.length,
					bytes
				)
			: 0
	);

	async function post() {
		if (!check.ok) return;
		signing = true;
		postError = null;
		try {
			await onpost(normalized);
			body = '';
		} catch (e) {
			postError = e instanceof Error ? e.message : String(e);
		} finally {
			signing = false;
		}
	}
</script>

{#if !signedIn}
	<div class="border-outline text-muted rounded-xl border border-dashed p-4 text-center text-sm">
		Connect a wallet to join the discussion. Comments stay visible either way.
	</div>
{:else if ability === null}
	<div class="bg-surface-container h-16 animate-pulse rounded-xl"></div>
{:else if ability.ok === false && ability.reason === 'blocked'}
	<div class="border-outline text-muted rounded-xl border border-dashed p-4 text-center text-sm">
		Your account cannot post here. Comments are moderated for spam, impersonation, harassment, and
		posts unrelated to what is being discussed.
	</div>
{:else if ability.ok === false && ability.reason === 'below_gate'}
	<div class="border-outline text-muted rounded-xl border border-dashed p-4 text-center text-sm">
		You need <AssetText variant="full" value={ability.gate.minBalance} /> available to comment. Your
		account has <AssetText variant="full" value={ability.liquid} /> available; the rest is staked.
		{#if context.network.supports('staking')}
			<Link href={context.urlPath('/staking')}>Unstake or add funds to join in.</Link>
		{/if}
	</div>
{:else if signing}
	<div class="border-outline rounded-xl border p-6 text-center">
		<p class="text-muted text-sm">Waiting for your wallet to sign</p>
	</div>
{:else}
	<form
		class="grid gap-3"
		onsubmit={(e) => {
			e.preventDefault();
			post();
		}}
	>
		<p class="text-muted flex items-center gap-2 text-sm">
			{#if vote === 1}
				<ThumbsUp class="text-success size-4" /> You voted to support this.
			{:else if vote === 0}
				<ThumbsDown class="text-error size-4" /> You voted to oppose this.
			{:else}
				You have not voted on this yet. Your comment posts either way.
			{/if}
		</p>
		{#if showChips && target}
			<p class="text-muted text-sm">
				{#if target.target.kind === 'topic'}
					Commenting on the proposal
				{:else if target.step}
					Commenting on Step {target.step}{#if target.title}: {target.title}{/if}
				{/if}
			</p>
		{/if}
		{#if target && !target.postable}
			<p class="text-muted text-sm">
				This step is closed to new comments. The discussion stays readable.
			</p>
		{/if}
		{#if showChips && !target}
			<p class="text-muted text-sm">Choose a step above to comment on it.</p>
		{:else if !(target && !target.postable)}
			<textarea
				bind:value={body}
				placeholder="Write a comment"
				aria-label="Write a comment"
				rows="6"
				class="border-outline bg-surface rounded-lg border p-3 text-sm"
			></textarea>
			<div class="text-muted flex flex-wrap items-center justify-between gap-2 text-xs">
				<span>Plain text only. Line breaks are kept.</span>
				{#if bytes > MAX_BODY_BYTES}
					<span class="text-error">{charsOver} characters over the limit.</span>
				{:else if bytes >= MAX_BODY_BYTES * 0.8}
					<span>
						{#if charsLeft === 0}No characters left.{:else}About {charsLeft} characters left.{/if}
					</span>
				{/if}
			</div>
			{#if !check.ok && check.reason === 'too_long'}
				<p class="text-error text-sm">
					This comment is too long. Shorten it by about {charsOver} characters to post.
				</p>
			{:else if !check.ok && check.reason === 'bidi'}
				<p class="text-error text-sm">
					This comment contains hidden text-direction characters that cannot be posted.
				</p>
			{:else if netShort}
				<p class="text-error text-sm">
					This comment is too long to send with your current network resources. Free up resources on
					your account, or shorten the comment by about {netShortChars} characters.
				</p>
			{/if}
			{#if postError}
				<p class="text-error text-sm">Your comment could not be posted.</p>
				<p class="text-muted text-xs">{postError}</p>
			{/if}
			<div class="flex items-center justify-end gap-3">
				{#if accountName && target?.postable}
					<p class="text-muted text-xs">
						Posts publicly as {accountName} and stays on chain permanently.
					</p>
				{/if}
				<Button type="submit" disabled={!ready}>Post comment</Button>
			</div>
		{/if}
	</form>
{/if}
