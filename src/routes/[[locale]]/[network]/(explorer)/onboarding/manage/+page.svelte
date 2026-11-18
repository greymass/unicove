<script lang="ts">
	import { getContext } from 'svelte';
	import { Card } from '@wharfkit/svelte-components';
	import type { UnicoveContext } from '$lib/state/client.svelte';
	import type { GiftProgram } from '$lib/state/creationindex/giftprogram.svelte';
	import {
		DEFAULT_QUOTA,
		approvalGroups,
		chainTime,
		type AdminAction,
		type ApprovalGroup
	} from '$lib/state/creationindex/onboarding';
	import Propose from '$lib/components/onboarding/propose.svelte';
	import Status from '$lib/components/onboarding/status.svelte';
	import { actionPhrase, approverText } from '$lib/components/onboarding/labels.svelte';
	import { formatBytes } from '$lib/utils/bytes';
	import { formatDateTime, formatNumber } from '$lib/utils/intl';

	const context = getContext<UnicoveContext>('state');
	const program = getContext<GiftProgram>('giftprogram');
	const locale = $derived(context.settings.data.locale);

	let groups = $state<ApprovalGroup[]>([]);
	approvalGroups(program.contract, program.permissions ?? [], program.getPermissions).then(
		(g) => (groups = g)
	);

	context.network.abis
		?.getAbi(program.contract)
		.then((abi) => program.loadProposals((p, n) => context.urlPath(`/api/msig/${p}/${n}`), abi));

	const who = (action: AdminAction) => {
		const group = groups.find((g) => g.actions.includes(action));
		return group ? approverText(group.approver, locale) : '...';
	};

	let creator = $state('');
	let quota = $state<number | undefined>(DEFAULT_QUOTA);

	const gifting = $derived(program.creators.length - program.suspendedCount);
	const expires = (time: string) =>
		formatDateTime(new Date(chainTime(time)), locale, { dateStyle: 'medium', timeStyle: 'short' });
	const authority = (p: NonNullable<typeof program.permissions>[number]) =>
		[
			p.authority.keys.length
				? `${p.authority.keys.length} ${p.authority.keys.length === 1 ? 'key' : 'keys'}`
				: '',
			...p.authority.accounts.map((a) => `${a.permission.actor}@${a.permission.permission}`)
		]
			.filter(Boolean)
			.join(', ');
</script>

<Card title="Program status">
	<div class="grid gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,22rem)]">
		<div class="grid content-start gap-2">
			<p class="text-headline">{program.enabled ? 'Gifting is on' : 'Gifting is off'}</p>
			{#if program.enabled}
				<p class="text-pretty">
					{formatNumber(gifting, locale)} of {formatNumber(program.creators.length, locale)} registered
					can gift from {formatBytes(program.available)}.
					{#if program.suspendedCount}
						{formatNumber(program.suspendedCount, locale)} suspended.
					{/if}
				</p>
			{:else}
				<p class="text-pretty">
					No creator can gift. Registrations and quotas stay in place for when gifting is turned
					back on.
				</p>
			{/if}
		</div>
		<div class="bg-surface-container grid content-start gap-2 rounded-2xl p-4">
			{#if program.enabled}
				<p class="text-sm">
					Turning gifting off stops every creator at once. Needs <strong>{who('disable')}</strong>.
				</p>
				<Propose {program} action="disable" submitLabel="Turn gifting off" />
			{:else}
				<p class="text-sm">
					Turning gifting on needs <strong>{who('enable')}</strong>. Whoever executes it runs any
					open proposal to turn gifting off first, in the same transaction.
				</p>
				<Propose {program} action="enable" submitLabel="Turn gifting on" />
			{/if}
		</div>
	</div>
</Card>

<Card title="Open proposals">
	{#if program.proposalsFailed}
		<p class="text-muted text-sm">Open proposals are unavailable right now.</p>
	{:else if program.proposals === null}
		<p class="text-muted animate-pulse text-sm">Loading proposals...</p>
	{:else if program.proposals.length === 0}
		<p class="text-muted text-sm">
			No open proposal acts on <span class="font-mono">{program.contract}</span>.
		</p>
	{:else}
		<ul class="grid gap-3 text-sm">
			{#each program.proposals as proposal (proposal.proposer + proposal.name)}
				<li class="grid gap-x-4 gap-y-1 md:grid-cols-[minmax(0,1fr)_auto_auto] md:items-baseline">
					<a
						class="text-primary"
						href={context.urlPath(`/msig/${proposal.proposer}/${proposal.name}`)}
					>
						{proposal.actions
							.map((a) =>
								a.creator ? `${actionPhrase(a.name)}: ${a.creator}` : actionPhrase(a.name)
							)
							.join(', ')}
						<span class="text-muted font-mono text-xs">{proposal.proposer}/{proposal.name}</span>
					</a>
					<span class="tabular-nums">
						{#if proposal.threshold !== null}
							{formatNumber(proposal.satisfied ?? 0, locale)} of {formatNumber(
								proposal.threshold,
								locale
							)} approved{#if proposal.standby}<span class="text-muted"
									>, {formatNumber(proposal.standby, locale)} standby not counted</span
								>{/if}
						{/if}
					</span>
					<span class="text-muted text-xs">expires {expires(proposal.expiration)}</span>
				</li>
			{/each}
		</ul>
	{/if}
</Card>

<div class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,24rem)]">
	<Card title="Admit a creator">
		<p class="text-muted text-sm">Needs <strong>{who('addcreator')}</strong>.</p>
		<Propose
			{program}
			action="addcreator"
			editCreator
			bind:creator
			bind:quota
			withLink
			submitLabel="Review admission"
		/>
	</Card>

	<Card title="Change one creator">
		<p class="text-muted text-sm">
			Quota changes, suspensions and removals are proposed from each creator's page.
		</p>
		<ul class="grid gap-1">
			{#each program.creators as row (row.creator)}
				<li>
					<a
						class="hover:bg-surface-container flex items-center gap-3 rounded-lg px-2 py-2"
						href={context.urlPath(`/onboarding/creators/${row.creator}`)}
					>
						<span class="font-medium">{row.creator}</span>
						<span class="text-muted ml-auto font-mono text-xs">
							{formatBytes(row.daily_quota_bytes)}/day
						</span>
						<Status suspended={row.suspended} enabled={program.enabled} />
						<span class="text-primary">›</span>
					</a>
				</li>
			{:else}
				<li class="text-muted text-sm">No creator is registered.</li>
			{/each}
		</ul>
	</Card>
</div>

<Card title="Who approves what">
	<ul class="grid gap-3">
		{#each groups as group (group.permission)}
			<li class="grid gap-1 md:grid-cols-[14rem_minmax(0,1fr)] md:gap-4">
				<span class="font-medium">{approverText(group.approver, locale)}</span>
				<span class="text-sm">
					{group.actions.map((a) => actionPhrase(a)).join(' · ')}
					<span class="text-muted font-mono text-xs">{program.contract}@{group.permission}</span>
				</span>
			</li>
		{:else}
			<li class="text-muted animate-pulse text-sm">Reading permissions...</li>
		{/each}
	</ul>
	<details class="text-sm">
		<summary class="text-muted cursor-pointer">Permission details</summary>
		<div class="overflow-x-auto">
			<table class="mt-2 w-full">
				<thead class="text-muted text-left">
					<tr class="border-outline border-b">
						<th class="py-2 font-normal">Permission</th>
						<th class="py-2 font-normal">Authority</th>
						<th class="py-2 font-normal">Linked actions</th>
					</tr>
				</thead>
				<tbody>
					{#each program.permissions ?? [] as permission (permission.name)}
						<tr class="border-outline/50 border-b align-top">
							<td class="py-1.5 font-mono">{permission.name}</td>
							<td class="py-1.5 font-mono text-xs">
								{authority(permission)} (threshold {permission.authority.threshold})
							</td>
							<td class="py-1.5 font-mono text-xs">
								{permission.links
									.filter((l) => l.account === program.contract)
									.map((l) => l.action ?? '*')
									.join(', ')}
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</details>
</Card>
