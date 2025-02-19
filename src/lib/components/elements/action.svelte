<script lang="ts">
	import {
		Action,
		Name,
		PermissionLevel,
		Serializer,
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
	import type { ActionSummaryProps, DecodedActionData } from '$lib/types/transaction';

	const context = getContext<UnicoveContext>('state');

	interface Props {
		action: Action;
		datetime?: Date;
		decoded?: DecodedActionData;
		id?: Checksum256Type;
		notified?: Name[];
		summary?: Component<ActionSummaryProps, object>;
		variant?: ActionDisplayVariants;
	}

	let {
		action,
		datetime,
		decoded,
		id,
		notified,
		summary: ActionSummary,
		variant = 'json'
	}: Props = $props();

	async function decode() {
		if (!context.network.abis) return;
		const abi = await context.network.abis?.getAbi(action.account);
		return Serializer.decode({
			data: action.data,
			type: String(action.name),
			abi: abi
		});
	}
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
		{:else if isObject}
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

{#snippet Json()}
	<Code>
		<div class="overflow-auto rounded bg-shark-950 p-4">
			{JSON.stringify(action, null, 2)}
		</div>
	</Code>
{/snippet}

{#snippet Decoded()}
	<Code>
		<div class="overflow-auto rounded bg-shark-950 p-4">
			{#await decode()}
				Loading...
			{:then decoded}
				{JSON.stringify(decoded, null, 2)}
			{:catch error}
				{error.message}
				{JSON.stringify(action, null, 2)}
			{/await}
		</div>
	</Code>
{/snippet}

{#snippet Pretty(data: DecodedActionData | undefined)}
	{#if data}
		<div class="overflow-auto rounded bg-shark-950 p-8">
			{#each Object.keys(data) as key}
				{@render KeyValue(key, data[key])}
			{/each}
		</div>
	{:else}
		<div class="text-muted">No decoded data</div>
	{/if}
{/snippet}

{#snippet Summary()}
	{#if decoded && ActionSummary}
		<ActionSummary data={decoded} />
	{:else}
		{@render Pretty(decoded)}
	{/if}
{/snippet}

<div class="rounded bg-mineShaft-950 p-2">
	<div class="border-bottom p-4">
		<div class="flex">
			<div>
				<Contract name={action.account} action={action.name}>
					<div class="text-2xl text-white">
						{action.name}
					</div>
				</Contract>
				<Contract name={action.account}>
					<span class="text-muted">
						{action.account} contract
					</span>
				</Contract>
			</div>

			<div class="text-muted flex-1 text-right align-baseline text-sm">
				{#if datetime}
					<DateTime {datetime} />
				{/if}
				{#if id}
					<div>
						ID: <Transaction {id} />
					</div>
				{/if}
			</div>
		</div>
	</div>
	<div class="p-4">
		{#if variant === 'summary'}
			{@render Summary()}
		{:else if variant === 'pretty'}
			{@render Pretty(decoded)}
		{:else if variant === 'decoded'}
			{@render Decoded()}
		{:else if variant === 'json'}
			{@render Json()}
		{/if}
	</div>
	<div class="flex p-4">
		<div>
			<span class="text-muted">Authorization:</span>
			{#each action.authorization as auth}
				<Account name={Name.from(auth.actor)}>
					{PermissionLevel.from(auth)}
				</Account>
			{/each}
		</div>

		<div class="flex-1 text-right">
			{#if notified}
				{#each notified as account}
					<Account name={Name.from(account)} />
				{/each}
				<span class="text-muted"> notified </span>
			{/if}
		</div>
	</div>
</div>
