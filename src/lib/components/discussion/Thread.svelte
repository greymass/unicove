<script lang="ts">
	import { getContext } from 'svelte';
	import { Name } from '@wharfkit/antelope';
	import { Button, Chip } from 'unicove-components';
	import type { UnicoveContext } from '$lib/state/client.svelte';
	import { ThreadState } from '$lib/discussion/thread.svelte';
	import { defaultPostTarget, type TargetDescriptor } from '$lib/discussion/targets';
	import { buildComment, packContent } from '$lib/msg/content';
	import { abilityFor, isBlocked, loadGate, type PostAbility } from '$lib/msg/gate';
	import { GOVERNANCE_CHANNEL, tupleKey } from '$lib/msg/model';
	import { commentKey, visibleComments } from '$lib/msg/reconcile';
	import Comment from './Comment.svelte';
	import Composer from './Composer.svelte';
	import TargetVotePanel from './TargetVotePanel.svelte';

	interface Props {
		descriptors: TargetDescriptor[];
		active: TargetDescriptor | null;
		onselect: (descriptor: TargetDescriptor | null) => void;
		votes: Map<string, number>;
		userVotes: Map<string, number | null>;
		onuservote: (descriptor: TargetDescriptor, voteType: number | null) => void;
		showChips: boolean;
		locale: string;
	}

	const { descriptors, active, onselect, votes, userVotes, onuservote, showChips, locale }: Props =
		$props();
	const context = getContext<UnicoveContext>('state');

	const apiBase = context.urlPath('/api/msg');
	const msgAccount = String(context.network.contracts.msg.account);
	const tuples = $derived((active ? [active] : descriptors).map((d) => d.tuple));

	let thread = $state<ThreadState>(new ThreadState(fetch, apiBase, []));
	$effect(() => {
		const next = new ThreadState(fetch, apiBase, tuples);
		thread = next;
		let cancelled = false;
		let stop: (() => void) | undefined;
		next.load().then(() => {
			if (cancelled) return;
			stop = next.start();
		});
		return () => {
			cancelled = true;
			stop?.();
		};
	});

	const viewer = $derived(context.account ? String(context.account.name) : null);
	const signedIn = $derived(Boolean(context.wharf.session && context.account));
	const target = $derived(defaultPostTarget(descriptors, active));
	const voteFor = $derived(target ? (userVotes.get(target.key) ?? null) : null);

	let ability = $state<PostAbility | null>(null);
	$effect(() => {
		const account = context.account;
		if (!account) {
			ability = null;
			return;
		}
		let cancelled = false;
		(async () => {
			try {
				const [gate, blocked] = await Promise.all([
					loadGate(context.network.client, msgAccount, GOVERNANCE_CHANNEL),
					isBlocked(context.network.client, msgAccount, GOVERNANCE_CHANNEL, String(account.name))
				]);
				if (cancelled) return;
				ability = abilityFor(gate, account.balance.balance, blocked);
			} catch {
				if (!cancelled) ability = { ok: true };
			}
		})();
		return () => {
			cancelled = true;
		};
	});
	const netAvailable = $derived(
		context.account ? Number(context.account.resources.net.available) : null
	);

	const comments = $derived(visibleComments(thread.comments));

	async function post(body: string) {
		if (!context.account || !target) return;
		const fields = buildComment(target.target, body);
		const content = packContent(fields);
		const sender = context.account.name;
		const action = context.network.contracts.msg.action('send', {
			sender,
			channel: Name.from(GOVERNANCE_CHANNEL),
			content
		});
		const result = await context.wharf.transact({ action });
		thread.addPending(String(sender), fields, String(result.resolved?.transaction.id ?? ''));
	}

	async function edit(seq: number, body: string) {
		const existing = thread.comments.find((c) => c.seq === seq);
		if (!context.account || !existing) return;
		const targetOf = descriptors.find((d) => tupleKey(d.tuple) === tupleKey(existing.tags ?? []));
		if (!targetOf) throw new Error('Unknown comment target');
		const fields = buildComment(targetOf.target, body);
		const action = context.network.contracts.msg.action('edit', {
			sender: context.account.name,
			channel: Name.from(GOVERNANCE_CHANNEL),
			seq,
			content: packContent(fields)
		});
		await context.wharf.transact({ action });
		thread.applyEdit(seq, fields.body);
	}

	async function remove(seq: number) {
		if (!context.account) return;
		const action = context.network.contracts.msg.action('del', {
			sender: context.account.name,
			channel: Name.from(GOVERNANCE_CHANNEL),
			seq
		});
		await context.wharf.transact({ action });
		thread.markDeleted(seq);
	}
</script>

<div class="grid gap-6">
	{#if showChips}
		<div class="flex flex-wrap gap-2" role="group" aria-label="Filter comments by target">
			<button
				onclick={() => onselect(null)}
				class="cursor-pointer"
				aria-current={active === null ? 'true' : undefined}
			>
				<Chip class={active === null ? 'bg-primary text-on-primary' : ''}>All</Chip>
			</button>
			{#each descriptors as d (d.key)}
				<button
					onclick={() => onselect(d)}
					class="cursor-pointer"
					aria-current={active?.key === d.key ? 'true' : undefined}
				>
					<Chip class={active?.key === d.key ? 'bg-primary text-on-primary' : ''}>
						{#if d.target.kind === 'topic'}Proposal{:else if d.step}Step {d.step}{#if d.title}: {d.title}{/if}{:else}{d.label}{/if}
					</Chip>
				</button>
			{/each}
		</div>
	{/if}

	{#if target}
		<TargetVotePanel
			descriptor={target}
			vote={userVotes.get(target.key)}
			onvote={(v) => onuservote(target, v)}
		/>
	{/if}

	{#if thread.error}
		<div
			class="bg-error/10 text-error border-error/30 flex items-center justify-between gap-2 rounded border px-4 py-2 text-sm"
		>
			<span>{thread.error}</span>
			<Button variant="text" class="text-error" onclick={() => thread.refresh()}>Try Again</Button>
		</div>
	{/if}

	{#if thread.unavailable}
		<p class="text-muted text-sm">Discussion is not available on this network.</p>
	{:else if !thread.ready}
		<div class="grid animate-pulse gap-3">
			<div class="bg-surface-container h-16 rounded"></div>
			<div class="bg-surface-container h-16 rounded"></div>
		</div>
	{:else}
		<p class="text-muted text-xs">
			Comments are on-chain messages signed by your account and are public and permanent. Moderators
			remove comments that are spam, impersonation, harassment, or unrelated to what is being
			discussed, and block accounts that repeat it. A removed comment stays on chain and stops
			appearing on Unicove.
		</p>
		{#if thread.hasMore}
			<div>
				<Button variant="secondary" onclick={() => thread.loadEarlier()}
					>Load earlier comments</Button
				>
			</div>
		{/if}
		<div class="grid gap-5" aria-live="polite" aria-relevant="additions">
			{#if comments.length === 0}
				<p
					class="border-outline text-muted rounded-xl border border-dashed p-4 text-center text-sm"
				>
					No comments yet.
				</p>
			{:else}
				{#each comments as comment (commentKey(comment))}
					<Comment
						{comment}
						vote={votes.get(comment.sender) ?? null}
						{viewer}
						{locale}
						showTarget={showChips && active === null}
						ondelete={remove}
						onedit={edit}
					/>
				{/each}
			{/if}
		</div>
		<Composer
			{signedIn}
			{ability}
			{netAvailable}
			vote={voteFor}
			{showChips}
			{target}
			onpost={post}
		/>
	{/if}
</div>
