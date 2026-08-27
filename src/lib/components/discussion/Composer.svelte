<script lang="ts">
	import { Button } from 'unicove-components';
	import ThumbsUp from '@lucide/svelte/icons/thumbs-up';
	import ThumbsDown from '@lucide/svelte/icons/thumbs-down';
	import AssetText from '$lib/components/elements/asset.svelte';
	import type { PostAbility } from '$lib/msg/gate';
	import {
		MAX_BODY_BYTES,
		WARN_BODY_BYTES,
		checkBody,
		estimateNetBytes,
		normalizeBody
	} from '$lib/msg/model';
	import { formatBytes } from '$lib/utils/bytes';
	import type { TargetDescriptor } from '$lib/discussion/targets';

	interface Props {
		signedIn: boolean;
		ability: PostAbility | null;
		netAvailable: number | null;
		vote: number | null;
		targets: TargetDescriptor[];
		target: TargetDescriptor | null;
		ontarget: (target: TargetDescriptor) => void;
		onpost: (body: string) => Promise<void>;
	}

	const { signedIn, ability, netAvailable, vote, targets, target, ontarget, onpost }: Props =
		$props();

	let body = $state('');
	let signing = $state(false);
	let postError = $state<string | null>(null);

	const normalized = $derived(normalizeBody(body));
	const check = $derived(checkBody(normalized));
	const bytes = $derived(check.bytes);
	const netEstimate = $derived(estimateNetBytes(bytes + 40));
	const heavy = $derived(bytes > WARN_BODY_BYTES);
	const netShort = $derived(netAvailable !== null && netEstimate > netAvailable);
	const ready = $derived(check.ok && !signing && !netShort && target !== null && target.postable);

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
	<div class="bg-error-container text-on-error-container rounded-xl p-4 text-center text-sm">
		This account cannot post in the governance channel.
	</div>
{:else if ability.ok === false && ability.reason === 'below_gate'}
	<div class="border-outline text-muted rounded-xl border border-dashed p-4 text-center text-sm">
		Commenting needs at least <AssetText variant="full" value={ability.gate.minBalance} /> held liquid.
		Your account holds <AssetText variant="full" value={ability.liquid} />.
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
				<ThumbsUp class="text-success size-4" /> Commenting as a supporter
			{:else if vote === 0}
				<ThumbsDown class="text-error size-4" /> Commenting as an opponent
			{:else}
				You have not voted on this yet. Your comment posts either way.
			{/if}
		</p>
		{#if targets.length > 1}
			<label class="text-muted grid gap-1 text-xs">
				Comment on
				<select
					class="border-outline bg-surface rounded-lg border p-2 text-sm"
					value={target?.key ?? ''}
					onchange={(e) => {
						const next = targets.find((t) => t.key === e.currentTarget.value);
						if (next) ontarget(next);
					}}
				>
					{#each targets as option (option.key)}
						<option value={option.key} disabled={!option.postable}>
							{#if option.step}Step {option.step}{#if option.title}: {option.title}{/if}{:else}{option.label}{/if}
						</option>
					{/each}
				</select>
			</label>
		{/if}
		{#if target && !target.postable}
			<p class="text-muted text-sm">This target is closed. Its discussion stays readable.</p>
		{/if}
		<textarea
			bind:value={body}
			placeholder="Write a comment"
			aria-label="Write a comment"
			rows="6"
			class="border-outline bg-surface rounded-lg border p-3 text-sm"
		></textarea>
		<div class="text-muted flex flex-wrap items-center justify-between gap-2 text-xs">
			<span>Plain text only. Line breaks are kept.</span>
			<span
				class:text-error={!check.ok && check.reason === 'too_long'}
				class:text-primary={heavy && check.ok}
			>
				{formatBytes(bytes)} / {formatBytes(MAX_BODY_BYTES)}
			</span>
		</div>
		{#if !check.ok && check.reason === 'too_long'}
			<p class="text-error text-sm">This comment is longer than the channel allows.</p>
		{:else if !check.ok && check.reason === 'bidi'}
			<p class="text-error text-sm">
				This comment contains a bidirectional control character, which the chain rejects. Remove it
				to post.
			</p>
		{:else if netShort}
			<p class="text-error text-sm">
				This comment needs about {formatBytes(netEstimate)} of NET and your account has {formatBytes(
					netAvailable ?? 0
				)} available. Stake or power up NET, or shorten the comment.
			</p>
		{:else if heavy}
			<p class="text-primary text-sm">
				Long comments use more NET. This one needs about {formatBytes(netEstimate)}.
			</p>
		{/if}
		{#if postError}
			<p class="text-error text-sm">{postError}</p>
		{/if}
		<div class="flex justify-end">
			<Button type="submit" disabled={!ready}>Post comment</Button>
		</div>
	</form>
{/if}

<p class="text-muted text-xs">
	Comments are on-chain messages signed by your account and are public and permanent. Posting
	requires 10 A held liquid. Moderators remove comments that are spam, impersonation, harassment, or
	unrelated to the target, and block accounts that repeat it. A removed comment stays on chain and
	stops appearing on Unicove.
</p>
