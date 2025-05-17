<script lang="ts">
	import {
		Action,
		Checksum256,
		Name,
		PermissionLevel,
		type Checksum256Type
	} from '@wharfkit/antelope';
	import Code from '../code.svelte';
	import Account from '$lib/components/elements/account.svelte';
	import Contract from '$lib/components/elements/contract.svelte';
	import DateTime from '$lib/components/elements/datetime.svelte';
	import type { ActionDisplayVariants } from '$lib/types';
	import Transaction from './transaction.svelte';
	import type { UnicoveContext } from '$lib/state/client.svelte';
	import { getContext, type Component } from 'svelte';
	import type { ActionSummaryProps, ObjectifiedActionData } from '$lib/types/transaction';
	import SquareTerminal from 'lucide-svelte/icons/square-terminal';
	import Card from '../layout/box/card.svelte';

	import * as m from '$lib/paraglide/messages';
	import ActionSummaryContainer from '$lib/components/summary/components/container.svelte';
	import Switcher from '../layout/switcher.svelte';
	import { summaryTitles } from '../summary';

	const context = getContext<UnicoveContext>('state');

	interface Props {
		action: Action;
		datetime?: Date;
		objectified?: ObjectifiedActionData;
		id?: Checksum256Type;
		notified?: Name[];
		perspectiveOf?: Name;
		summary?: Component<ActionSummaryProps, object>;
		variant?: ActionDisplayVariants;
	}

	let {
		action,
		datetime,
		objectified,
		perspectiveOf,
		id,
		notified,
		summary: ActionSummary,
		variant = 'pretty'
	}: Props = $props();

	let advancedMode = $derived(context.settings.data.advancedMode);

	let summaryTitle = $derived(summaryTitles[`${action.account}_${action.name}`]);
</script>

{#snippet KeyValue(key: string | null, value: string)}
	{@const isArray = Array.isArray(value)}
	{@const isObject = typeof value === 'object'}

	{#if key}
		{#if isArray || isObject}
			<dt class="text-muted inline after:content-[':']">
				{key}
			</dt>
			{#if isArray}
				<dd class="inline">
					<span class="sr-only">{m.common_length()}</span>({value.length})
				</dd>
			{/if}
		{:else}
			<dt class="text-muted inline after:content-[':']">
				{key}
			</dt>
		{/if}
	{/if}

	{#if isArray}
		<dd>
			<ol class="ml-4 list-inside list-decimal">
				{#each value as v}
					<li class="marker:text-muted text-on-surface text-sm">
						{@render KeyValue(null, v)}
					</li>
				{/each}
			</ol>
		</dd>
	{:else if isObject && value}
		<ul class="ml-4">
			{#each Object.keys(value) as k}
				<li class="text-sm">
					{@render KeyValue(k, value[k])}
				</li>
			{/each}
		</ul>
	{:else}
		<dd class="text-on-surface inline">
			{value}
		</dd>
	{/if}
{/snippet}

{#snippet Decoded()}
	{#await context.network.decodeAction(action)}
		<Code json={m.common_loading()} />
	{:then result}
		<Code json={result} />
	{:catch error}
		{error.message}
		<Code json={action} />
	{/await}
{/snippet}

{#snippet Pretty(data: ObjectifiedActionData | undefined)}
	<Code collapsible class="bg-surface-container-high mt-1" indent={4}>
		{#if data}
			<dl>
				{#each Object.keys(data) as key}
					<div>
						{@render KeyValue(key, data[key])}
					</div>
				{/each}
			</dl>
		{:else}
			<span class="text-muted">{m.common_no_data()}</span>
		{/if}
	</Code>
{/snippet}

{#snippet Ricardian()}
	<Code>
		<div class="bg-surface-container overflow-auto rounded-sm p-4">
			Rendering of the ricardian contract is not yet supported.
		</div>
	</Code>
{/snippet}

{#snippet Summary()}
	{#if typeof objectified === 'object' && ActionSummary}
		<ActionSummaryContainer>
			<ActionSummary data={objectified} authorization={action.authorization} {perspectiveOf} />
		</ActionSummaryContainer>
	{:else}
		{@render Pretty(objectified)}
	{/if}
{/snippet}

{#snippet Header()}
	<Switcher class="items-center gap-x-2 gap-y-2">
		<div class="flex items-center gap-4">
			<picture class="bg-surface-container-high grid size-14 place-items-center rounded-full">
				<SquareTerminal />
			</picture>

			<div class="grid gap-px font-mono">
				{#if summaryTitle}
					<div class="text-on-surface leading-none md:text-2xl">
						{summaryTitle}
					</div>
				{:else}
					<Contract
						name={action.account}
						action={action.name}
						class="text-on-surface leading-none md:text-2xl"
					>
						{action.name}
					</Contract>
				{/if}

				<div>
					<Contract name={action.account} class="text-muted leading-none">
						{action.account}
					</Contract>
					{#if summaryTitle}
						::
						<Contract name={action.account} action={action.name} class="text-muted leading-none">
							{action.name}
						</Contract>
					{/if}
				</div>
			</div>
		</div>

		<div class="grid gap-1 text-right text-nowrap">
			{#if id}
				<Transaction {id} class="block font-mono leading-none md:text-2xl" />
			{/if}

			{#if datetime}
				<span class="text-muted text-sm leading-none tabular-nums">
					<DateTime {datetime} />
				</span>
			{/if}
		</div>
	</Switcher>
{/snippet}

{#snippet Footer()}
	<div class="flex justify-between gap-6 px-1">
		<div>
			{#if action.authorization.length}
				<span class="text-muted text-xs">{m.common_signed_by()}</span>
				<ul class="inline">
					{#each action.authorization as auth}
						<li class="inline">
							<Account name={Name.from(auth.actor)} class="text-on-surface mr-1  text-xs">
								{PermissionLevel.from(auth)}
							</Account>
						</li>
					{/each}
				</ul>
			{/if}
		</div>

		<!-- This section is reversed so the list reads better for a11y -->
		<div class="flex flex-row-reverse flex-wrap-reverse items-baseline gap-1 text-right">
			{#if advancedMode && notified}
				<span class="text-muted text-xs">{m.common_notified()}</span>
				<ul class="inline">
					{#each notified as account}
						<li class="group inline text-xs nth-last-2:after:content-['and_']">
							<Account
								name={Name.from(account)}
								class="after:text-muted text-on-surface gap-0 text-xs group-has-nth-3:bg-red-300 not-group-nth-last-2:not-group-last:after:content-[','] first:ml-0"
							/>
						</li>
					{/each}
				</ul>
			{/if}
		</div>
	</div>
{/snippet}

<Card class="gap-4">
	{@render Header()}
	<svelte:boundary
		onerror={(error) =>
			console.warn(`Summary Component Rendering error for ${action.account}:${action.name}`, error)}
	>
		{#snippet failed()}
			{#if context.settings.data.developerMode}
				Error decoding for action summary, displaying raw data instead.
			{/if}
			{@render Pretty(objectified)}
		{/snippet}
		{#if variant === 'summary'}
			{@render Summary()}
		{:else if variant === 'ricardian'}
			{@render Ricardian()}
		{:else if variant === 'pretty'}
			{@render Pretty(objectified)}
		{:else if variant === 'decoded'}
			{@render Decoded()}
		{:else if variant === 'json'}
			<Code json={action} />
		{/if}

		{#if action.account.equals('eosio') && action.name.equals('setcode') && objectified && objectified.code}
			{@render Pretty({ hash: String(Checksum256.hash(objectified.code)) })}
		{/if}

		{#if variant !== 'summary'}
			{@render Footer()}
		{/if}
	</svelte:boundary>
</Card>
