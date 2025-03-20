<script lang="ts">
	import {
		Action,
		Checksum256,
		Name,
		PermissionLevel,
		type ABISerializable,
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

{#snippet CodeBox(data: Action | ABISerializable)}
	<Code>
		<div class="overflow-auto rounded-sm bg-shark-950 p-4">
			{JSON.stringify(data, null, 4)}
		</div>
	</Code>
{/snippet}

{#snippet Decoded()}
	{#await context.network.decodeAction(action)}
		{@render CodeBox('Loading...')}
	{:then result}
		{@render CodeBox(result)}
	{:catch error}
		{error.message}
		{@render CodeBox(action)}
	{/await}
{/snippet}

{#snippet Pretty(data: ObjectifiedActionData | undefined)}
	<Code>
		<div class="overflow-auto rounded-sm bg-shark-950 p-4">
			{#if data}
				{#each Object.keys(data) as key}
					{@render KeyValue(key, data[key])}
				{/each}
			{:else}
				<span class="text-muted">No data</span>
			{/if}
		</div>
	</Code>
{/snippet}

{#snippet Ricardian()}
	<Code>
		<div class="overflow-auto rounded-sm bg-shark-950 p-4">
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
	<div class="flex">
		<div>
			<picture class="mr-4 grid size-14 place-items-center rounded-full bg-mine-shaft-900">
				<SquareTerminal />
			</picture>
		</div>
		<div class="font-mono">
			<div>
				<Contract name={action.account} class="text-muted">
					{action.account}
				</Contract>
			</div>
			<Contract name={action.account} action={action.name} class="text-2xl text-white">
				{action.name}
			</Contract>
		</div>
		<div class="text-muted flex-1 text-right align-baseline text-sm">
			{#if datetime}
				<DateTime {datetime} />
			{/if}
			<div class="text-2xl text-white">
				{#if id}
					<div class="font-mono">
						<Transaction {id} class="text-muted" />
					</div>
				{/if}
			</div>
		</div>
	</div>
{/snippet}

{#snippet Footer()}
	<div class="flex px-4">
		<div class="text-sm">
			{#if action.authorization.length}
				<span class="text-muted">Signed by:</span>
				{#each action.authorization as auth}
					<Account name={Name.from(auth.actor)} class="text-white">
						{PermissionLevel.from(auth)}
					</Account>
				{/each}
			{/if}
		</div>

		<div class="flex-1 text-right">
			{#if advancedMode && notified}
				{#each notified as account}
					<Account name={Name.from(account)} class="text-white" />
				{/each}
				<span class="text-muted"> notified </span>
			{/if}
		</div>
	</div>
{/snippet}

<div class="rounded-sm bg-mine-shaft-950 p-4">
	<div class="space-y-4">
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
			{@render CodeBox(action)}
		{/if}
		{#if action.account.equals('eosio') && action.name.equals('setcode') && objectified && objectified.code}
			{@render Pretty({ hash: String(Checksum256.hash(objectified.code)) })}
		{/if}
		{#if variant !== 'summary'}
			{@render Footer()}
		{/if}
	</div>
</div>
