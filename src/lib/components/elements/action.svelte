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

	const context = getContext<UnicoveContext>('state');

	interface Props {
		action: Action;
		datetime?: Date;
		objectified?: ObjectifiedActionData;
		id?: Checksum256Type;
		notified?: Name[];
		summary?: Component<ActionSummaryProps, object>;
		variant?: ActionDisplayVariants;
	}

	let {
		action,
		datetime,
		objectified,
		id,
		notified,
		summary: ActionSummary,
		variant = 'pretty'
	}: Props = $props();

	let advancedMode = $derived(context.settings.data.advancedMode);
</script>

{#snippet KeyValue(key: string, value: string)}
	{@const isArray = Array.isArray(value)}
	{@const isObject = typeof value === 'object'}
	<div class="font-mono text-white">
		{#if key}
			<span class="text-muted">
				{#if isArray || isObject}
					{key}:
					{#if isArray}
						({value.length})
					{/if}
				{:else}
					{key}:
				{/if}
			</span>
		{/if}
		{#if isArray}
			<ol class="list-decimal pl-4">
				{#each value as v}
					<li class="ml-4">
						{@render KeyValue('', v)}
					</li>
				{/each}
			</ol>
		{:else if isObject && value}
			<div class="ml-4">
				{#each Object.keys(value) as k}
					{@render KeyValue(k, value[k])}
				{/each}
			</div>
		{:else}
			{value}
		{/if}
	</div>
{/snippet}

{#snippet Decoded()}
	{#await context.network.decodeAction(action)}
		<Code json={'Loading...'} />
	{:then result}
		<Code json={result} />
	{:catch error}
		{error.message}
		<Code json={action} />
	{/await}
{/snippet}

{#snippet Pretty(data: ObjectifiedActionData | undefined)}
	<Code>
		{#if data}
			{#each Object.keys(data) as key}
				{@render KeyValue(key, data[key])}
			{/each}
		{:else}
			<span class="text-muted">No data</span>
		{/if}
	</Code>
{/snippet}

{#snippet Ricardian()}
	<Code>
		<div class="bg-shark-950 overflow-auto rounded-sm p-4">
			Rendering of the ricardian contract is not yet supported.
		</div>
	</Code>
{/snippet}

{#snippet Summary()}
	{#if typeof objectified === 'object' && ActionSummary}
		<ActionSummary data={objectified} />
	{:else}
		{@render Pretty(objectified)}
	{/if}
{/snippet}

{#snippet Header()}
	<div class="flex flex-wrap items-center gap-x-4 gap-y-2">
		<picture class="bg-mine-900/50 grid size-14 place-items-center rounded-full">
			<SquareTerminal />
		</picture>

		<div class="flex flex-col gap-1 font-mono">
			<Contract name={action.account} class="text-muted leading-none">
				{action.account}
			</Contract>

			<Contract name={action.account} action={action.name} class="text-2xl leading-none text-white">
				{action.name}
			</Contract>
		</div>

		<div class="flex flex-1 flex-col gap-1 text-right text-nowrap">
			{#if id}
				<Transaction {id} class="block font-mono text-2xl leading-none" />
			{/if}

			{#if datetime}
				<span class="text-muted text-sm leading-none tabular-nums">
					<DateTime {datetime} />
				</span>
			{/if}
		</div>
	</div>
{/snippet}

{#snippet Footer()}
	<div class="flex flex-wrap justify-between gap-2 px-1">
		<div>
			{#if action.authorization.length}
				<span class="text-muted">Signed by</span>
				{#each action.authorization as auth}
					<Account name={Name.from(auth.actor)} class="mr-1 text-white underline">
						{PermissionLevel.from(auth)}
					</Account>
				{/each}
			{/if}
		</div>

		<div class="text-right">
			{#if advancedMode && notified}
				{#each notified as account}
					<Account name={Name.from(account)} class="ml-1 text-white underline first:ml-0" />
				{/each}
				<span class="text-muted">notified</span>
			{/if}
		</div>
	</div>
{/snippet}

<Card class="gap-6">
	{@render Header()}
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
</Card>
