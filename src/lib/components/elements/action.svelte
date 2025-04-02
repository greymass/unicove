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
					<span class="sr-only">length</span>({value.length})
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
					<li class="marker:text-muted text-sm text-white">
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
		<dd class="inline text-white">
			{value}
		</dd>
	{/if}
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
	<Code collapsible class="bg-shark-950/30 mt-1" indent={4}>
		{#if data}
			<dl>
				{#each Object.keys(data) as key}
					<div>
						{@render KeyValue(key, data[key])}
					</div>
				{/each}
			</dl>
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
		<picture class="bg-shark-950/30 grid size-14 place-items-center rounded-full">
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
	<div class="flex justify-between gap-6 px-1">
		<div>
			{#if action.authorization.length}
				<span class="text-muted text-xs">Signed by</span>
				<ul class="inline">
					{#each action.authorization as auth}
						<li class="inline">
							<Account name={Name.from(auth.actor)} class="mr-1 text-xs  text-white">
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
				<span class="text-muted text-xs">notified</span>
				<ul class="inline">
					{#each notified as account}
						<li class="group inline text-xs nth-last-2:after:content-['and_']">
							<Account
								name={Name.from(account)}
								class="after:text-muted gap-0 text-xs text-white group-has-nth-3:bg-red-300 not-group-nth-last-2:not-group-last:after:content-[','] first:ml-0"
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
