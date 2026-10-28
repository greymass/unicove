<script lang="ts">
	import { getContext } from 'svelte';
	import { goto } from '$app/navigation';
	import { Action } from '@wharfkit/antelope';
	import { Button, NumberInput, TextInput } from '@wharfkit/svelte-components';
	import type { UnicoveContext } from '$lib/state/client.svelte';
	import { MESSAGER, type GiftProgram } from '$lib/state/creationindex/giftprogram.svelte';
	import {
		blockers,
		conflicting,
		describeApprover,
		expireDays,
		wantsLink,
		type AdminAction
	} from '$lib/state/creationindex/onboarding';
	import { formatBytes } from '$lib/utils/bytes';
	import { formatNumber } from '$lib/utils/intl';
	import {
		authorizeActions,
		buildProposal,
		resolveApprovers,
		suggestProposalName,
		type Level
	} from '$lib/wharf/msig/proposer';
	import { actionPhrase, approverText, blockerText } from './labels.svelte';

	interface Props {
		program: GiftProgram;
		action: AdminAction;
		creator?: string;
		editCreator?: boolean;
		quota?: number;
		withLink?: boolean;
		submitLabel?: string;
	}

	let {
		program,
		action,
		creator = $bindable(''),
		editCreator = false,
		quota = $bindable(),
		withLink = false,
		submitLabel = 'Review proposal'
	}: Props = $props();

	const context = getContext<UnicoveContext>('state');
	const locale = $derived(context.settings.data.locale);
	const id = $props.id();

	let link = $state('');
	let accountExists = $state<boolean | null>(null);
	let busy = $state(false);
	let failed = $state('');
	let review = $state<{
		proposal: Action;
		proposer: Level;
		name: string;
		permission: string;
		who: string;
		approvers: Level[];
		message: 'included' | 'omitted' | 'none';
	} | null>(null);

	const hasQuota = $derived(action === 'addcreator' || action === 'setquota');
	const input = $derived({
		action,
		creator,
		quota: hasQuota ? (quota ?? null) : null,
		row: program.row(creator),
		accountExists
	});
	const problems = $derived(blockers(input));
	const conflicts = $derived(conflicting(action, creator, program.proposals ?? []));
	const missingLink = $derived(
		withLink && (!!creator || !editCreator) && !link.trim() && wantsLink(input)
	);

	$effect(() => {
		void input;
		void link;
		void context.wharf.session;
		review = null;
		failed = '';
	});

	$effect(() => {
		if (action !== 'addcreator' || !/^[a-z1-5.]{1,12}$/.test(creator)) {
			accountExists = null;
			return;
		}
		const name = creator;
		const timer = setTimeout(() => {
			program.accountExists(name).then((exists) => {
				if (name === creator) accountExists = exists;
			});
		}, 300);
		return () => clearTimeout(timer);
	});

	async function prepare() {
		busy = true;
		failed = '';
		try {
			const abi = await context.network.abis!.getAbi(program.contract);
			const data = hasQuota
				? { creator, daily_quota_bytes: quota }
				: action === 'enable' || action === 'disable'
					? {}
					: { creator };
			const actions = [
				Action.from({ account: program.contract, name: action, authorization: [], data }, abi)
			];
			let message: 'included' | 'omitted' | 'none' = 'none';
			if (withLink && link.trim()) {
				if (await program.messagerExists()) {
					const messagerAbi = await context.network.abis!.getAbi(MESSAGER);
					actions.unshift(
						Action.from(
							{
								account: MESSAGER,
								name: 'message',
								authorization: [],
								data: { message: link.trim() }
							},
							messagerAbi
						)
					);
					message = 'included';
				} else {
					message = 'omitted';
				}
			}
			const authorized = await authorizeActions(program.contract, actions, program.getPermissions);
			const auth = authorized[authorized.length - 1].authorization[0];
			const permission = { actor: String(auth.actor), permission: String(auth.permission) };
			const approvers = await resolveApprovers({
				authorizations: authorized.map((a) => ({
					actor: String(a.authorization[0].actor),
					permission: String(a.authorization[0].permission)
				})),
				getPermissions: program.getPermissions,
				producerCandidates: context.producers.allActiveProducers
					.slice(0, 30)
					.map((p) => String(p.owner))
			});
			const info = await context.network.client.v1.chain.get_info();
			const session = context.wharf.session;
			const proposer = session
				? { actor: String(session.actor), permission: String(session.permission) }
				: { actor: '', permission: '' };
			const name = suggestProposalName(action);
			const proposal = buildProposal({
				proposer,
				proposalName: name,
				requested: approvers,
				actions: authorized,
				header: info.getTransactionHeader(expireDays(action) * 86400)
			});
			const approver = await describeApprover(
				permission.actor,
				permission.permission,
				program.getPermissions
			);
			review = {
				proposal,
				proposer,
				name,
				permission: `${permission.actor}@${permission.permission}`,
				who: approverText(approver, locale),
				approvers,
				message
			};
		} catch (e) {
			failed = e instanceof Error ? e.message : String(e);
		} finally {
			busy = false;
		}
	}

	async function propose() {
		if (!review || !context.wharf.session) return;
		busy = true;
		failed = '';
		try {
			await context.wharf.transact({ action: review.proposal });
			await goto(context.urlPath(`/msig/${review.proposer.actor}/${review.name}`));
		} catch (e) {
			failed = e instanceof Error ? e.message : String(e);
		} finally {
			busy = false;
		}
	}
</script>

<div class="grid gap-3">
	{#if editCreator}
		<label class="grid gap-1 text-sm" for="{id}-creator">
			<span class="text-muted">Creator account</span>
			<TextInput id="{id}-creator" bind:value={creator} autocomplete="off" />
		</label>
	{/if}
	{#if hasQuota}
		<label class="grid gap-1 text-sm" for="{id}-quota">
			<span class="text-muted">Daily quota in bytes</span>
			<NumberInput id="{id}-quota" bind:value={quota} min={0} />
			{#if quota}
				<span class="text-muted text-xs">{formatBytes(quota)}</span>
			{/if}
		</label>
	{/if}
	{#if withLink}
		<label class="grid gap-1 text-sm" for="{id}-link">
			<span class="text-muted">
				{action === 'addcreator' ? 'Application link' : 'Change request link'}
			</span>
			<TextInput id="{id}-link" bind:value={link} placeholder="https://" autocomplete="off" />
		</label>
	{/if}

	{#if creator || !editCreator}
		{#each problems as problem (problem)}
			<p class="text-error text-sm">{blockerText(problem, creator, locale)}</p>
		{/each}
	{/if}
	{#each conflicts as conflict (conflict.proposer + conflict.name)}
		<p class="text-warning text-sm">
			An open proposal already acts on this:
			<a class="underline" href={context.urlPath(`/msig/${conflict.proposer}/${conflict.name}`)}>
				{conflict.actions.map((a) => actionPhrase(a.name)).join(', ')}
				({conflict.proposer}/{conflict.name})
			</a>
		</p>
	{/each}
	{#if missingLink}
		<p class="text-warning text-sm">Producers usually want a link to the case for this change.</p>
	{/if}

	{#if !review}
		<Button
			variant={action === 'disable' || action === 'suspend' || action === 'rmcreator'
				? 'secondary'
				: 'primary'}
			disabled={busy || problems.length > 0}
			onclick={prepare}
		>
			{busy ? 'Resolving approvers...' : submitLabel}
		</Button>
	{:else}
		<dl
			class="border-outline grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 rounded-lg border p-3 text-sm"
		>
			<dt class="text-muted">Needs</dt>
			<dd>
				<strong>{review.who}</strong>
				<span class="text-muted font-mono text-xs">{review.permission}</span>
			</dd>
			<dt class="text-muted">Requests</dt>
			<dd>
				{#if review.approvers.length === 1}
					1 approval
				{:else}
					{formatNumber(review.approvers.length, locale)} approvals
				{/if}
				<span class="text-muted font-mono text-xs break-words">
					{review.approvers.map((a) => `${a.actor}@${a.permission}`).join(', ')}
				</span>
			</dd>
			<dt class="text-muted">Proposal</dt>
			<dd class="font-mono">{review.name}</dd>
			<dt class="text-muted">Expires</dt>
			<dd>in {formatNumber(expireDays(action), locale)} days</dd>
			{#if review.message === 'included'}
				<dt class="text-muted">Link</dt>
				<dd>Sent first as a {MESSAGER} message</dd>
			{:else if review.message === 'omitted'}
				<dt class="text-muted">Link</dt>
				<dd>Left out: {MESSAGER} does not exist on this chain</dd>
			{/if}
		</dl>
		{#if context.wharf.session}
			<Button variant="primary" disabled={busy} onclick={propose}>
				{busy ? 'Proposing...' : 'Propose'}
			</Button>
		{:else}
			<p class="text-muted text-sm">Sign in to propose this from your account.</p>
		{/if}
	{/if}
	{#if failed}
		<p class="text-error text-sm">{failed}</p>
	{/if}
</div>
