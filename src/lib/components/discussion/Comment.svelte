<script lang="ts">
	import { Button, Chip } from 'unicove-components';
	import ThumbsUp from '@lucide/svelte/icons/thumbs-up';
	import ThumbsDown from '@lucide/svelte/icons/thumbs-down';
	import { getContext } from 'svelte';
	import Account from '$lib/components/elements/account.svelte';
	import CommentBody from './CommentBody.svelte';
	import type { UnicoveContext } from '$lib/state/client.svelte';
	import { chainDate } from '$lib/msg/api';
	import {
		byteLength,
		checkBody,
		MAX_BODY_BYTES,
		normalizeBody,
		targetFromTags
	} from '$lib/msg/model';
	import type { Comment } from '$lib/msg/reconcile';
	import { approxCharsFromBytes } from '$lib/utils/bytes';
	import { formatDateTime } from '$lib/utils/intl';
	import '$lib/utils/dayjs';
	import dayjs from 'dayjs';

	interface Props {
		comment: Comment;
		vote: number | null;
		viewer: string | null;
		locale: string;
		showTarget: boolean;
		ondelete: (seq: number) => Promise<void>;
		onedit: (seq: number, body: string) => Promise<void>;
	}

	const { comment, vote, viewer, locale, showTarget, ondelete, onedit }: Props = $props();
	const context = getContext<UnicoveContext>('state');

	const COLLAPSE_BYTES = 8192;
	const COLLAPSE_PX = 384;

	const when = $derived(comment.pending ? new Date() : chainDate(comment.timestamp));
	const own = $derived(!comment.pending && viewer !== null && viewer === comment.sender);
	const target = $derived(targetFromTags(comment.tags));
	const body = $derived(comment.body ?? '');

	let expanded = $state(false);
	let measured = $state(false);
	let tall = $state(false);
	let node = $state<HTMLElement>();
	const longBySource = $derived(byteLength(body) > COLLAPSE_BYTES);
	const collapsed = $derived(!expanded && (longBySource || tall));

	$effect(() => {
		if (node && !measured && !longBySource) {
			tall = node.offsetHeight > COLLAPSE_PX;
			measured = true;
		}
	});

	let editing = $state(false);
	let draft = $state('');
	let saving = $state(false);
	let editError = $state<string | null>(null);
	let deleting = $state(false);
	let deleteError = $state<string | null>(null);
	let confirmingDelete = $state(false);

	$effect(() => {
		void comment;
		confirmingDelete = false;
	});

	const normalizedDraft = $derived(normalizeBody(draft));
	const draftCheck = $derived(checkBody(normalizedDraft));
	const draftBytes = $derived(draftCheck.bytes);
	const draftRemainingBytes = $derived(MAX_BODY_BYTES - draftBytes);
	const draftCharsLeft = $derived(
		approxCharsFromBytes(draftRemainingBytes, normalizedDraft.length, draftBytes)
	);
	const draftCharsOver = $derived(
		approxCharsFromBytes(draftBytes - MAX_BODY_BYTES, normalizedDraft.length, draftBytes)
	);

	function beginEdit() {
		draft = body;
		editing = true;
		editError = null;
		confirmingDelete = false;
	}

	async function saveEdit() {
		if (!draftCheck.ok) return;
		saving = true;
		editError = null;
		try {
			await onedit(comment.seq, normalizedDraft);
			editing = false;
		} catch (e) {
			editError = e instanceof Error ? e.message : String(e);
		} finally {
			saving = false;
		}
	}

	async function remove() {
		deleting = true;
		deleteError = null;
		try {
			await ondelete(comment.seq);
		} catch (e) {
			deleteError = e instanceof Error ? e.message : String(e);
		} finally {
			deleting = false;
		}
	}
</script>

<article class="border-outline grid gap-2 border-l-2 py-1 pl-4" data-seq={comment.seq}>
	<header class="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
		<span class="font-medium"><Account name={comment.sender} /></span>
		{#if showTarget && target}
			<Chip class="text-xs">
				{#if target.kind === 'topic'}Proposal{:else}{target.proposer}/{target.proposal}{/if}
			</Chip>
		{/if}
		{#if vote === 1}
			<Chip class="text-success gap-1 text-xs"><ThumbsUp class="size-3" /> Supported</Chip>
		{:else if vote === 0}
			<Chip class="text-error gap-1 text-xs"><ThumbsDown class="size-3" /> Opposed</Chip>
		{/if}
		{#if comment.pending?.phase === 'confirming'}
			<Chip class="text-primary text-xs">Confirming</Chip>
		{:else if comment.pending?.phase === 'awaiting'}
			<Chip class="text-muted text-xs">Posted. It will appear here shortly.</Chip>
		{/if}
		<span class="text-muted ml-auto" title={formatDateTime(when, locale)}>
			{#if comment.pending}
				just now
			{:else}
				{dayjs(when).fromNow()}
			{/if}
			{#if comment.edited_at}
				<span class="text-xs">(edited)</span>
			{/if}
		</span>
	</header>

	{#if editing}
		<textarea
			bind:value={draft}
			rows="6"
			aria-label="Edit comment"
			class="border-outline bg-surface rounded-lg border p-3 text-sm"
		></textarea>
		<div class="text-muted flex justify-end text-xs">
			{#if draftBytes > MAX_BODY_BYTES}
				<span class="text-error">{draftCharsOver} characters over the limit.</span>
			{:else if draftBytes >= MAX_BODY_BYTES * 0.8}
				<span>
					{#if draftCharsLeft === 0}No characters left.{:else}About {draftCharsLeft} characters left.{/if}
				</span>
			{/if}
		</div>
		{#if !draftCheck.ok && draftCheck.reason === 'too_long'}
			<p class="text-error text-sm">
				This comment is too long. Shorten it by about {draftCharsOver} characters to post.
			</p>
		{:else if !draftCheck.ok && draftCheck.reason === 'bidi'}
			<p class="text-error text-sm">
				This comment contains hidden text-direction characters that cannot be posted.
			</p>
		{/if}
		{#if editError}
			<p class="text-error text-sm">Your change could not be saved.</p>
			<p class="text-muted text-xs">{editError}</p>
		{/if}
		<div class="flex gap-2">
			<Button onclick={saveEdit} disabled={saving || !draftCheck.ok}>Save</Button>
			<Button variant="secondary" onclick={() => (editing = false)} disabled={saving}>Cancel</Button
			>
		</div>
	{:else}
		<div
			bind:this={node}
			class="relative text-sm"
			class:max-h-96={collapsed}
			class:overflow-hidden={collapsed}
		>
			<CommentBody {body} />
			{#if collapsed}
				<div
					class="from-surface pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-linear-to-t to-transparent"
				></div>
			{/if}
		</div>
		{#if collapsed || (expanded && (longBySource || tall))}
			<div>
				<Button
					variant="text"
					class="px-0"
					aria-expanded={expanded}
					aria-label={expanded ? 'Show less of this comment' : 'Read more of this comment'}
					onclick={() => (expanded = !expanded)}
				>
					{#if expanded}Show less{:else}Read more{/if}
				</Button>
			</div>
		{/if}
	{/if}

	{#if deleteError}
		<p class="text-error text-sm">The comment could not be deleted.</p>
		<p class="text-muted text-xs">{deleteError}</p>
	{/if}

	{#if comment.pending?.phase === 'awaiting' || own}
		<footer class="text-muted flex items-center gap-4 text-xs">
			{#if comment.pending?.phase === 'awaiting'}
				<a
					class="text-primary focus-visible:ring-solar-500 -m-1.5 rounded p-1.5 hover:underline focus-visible:ring focus-visible:outline-hidden focus-visible:ring-inset"
					href={context.urlPath(`/transaction/${comment.pending.trx_id}`)}
				>
					View transaction
				</a>
			{/if}
			{#if own && !editing}
				<button
					class="focus-visible:ring-solar-500 -m-1.5 cursor-pointer rounded p-1.5 hover:underline focus-visible:ring focus-visible:outline-hidden focus-visible:ring-inset"
					onclick={beginEdit}>Edit</button
				>
				{#if confirmingDelete}
					<span>Delete this comment?</span>
					<button
						class="text-error focus-visible:ring-solar-500 -m-1.5 cursor-pointer rounded p-1.5 hover:underline focus-visible:ring focus-visible:outline-hidden focus-visible:ring-inset"
						onclick={remove}
						disabled={deleting}>Delete</button
					>
					<button
						class="focus-visible:ring-solar-500 -m-1.5 cursor-pointer rounded p-1.5 hover:underline focus-visible:ring focus-visible:outline-hidden focus-visible:ring-inset"
						onclick={() => (confirmingDelete = false)}
						disabled={deleting}>Cancel</button
					>
				{:else}
					<button
						class="hover:text-error focus-visible:ring-solar-500 -m-1.5 cursor-pointer rounded p-1.5 hover:underline focus-visible:ring focus-visible:outline-hidden focus-visible:ring-inset"
						onclick={() => (confirmingDelete = true)}>Delete</button
					>
				{/if}
			{/if}
		</footer>
	{/if}
</article>
