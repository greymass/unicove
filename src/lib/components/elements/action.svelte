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
	import type { ActionDisplayVariants } from '$lib/types';
	import Transaction from './transaction.svelte';
	import type { UnicoveContext } from '$lib/state/client.svelte';
	import { getContext, type Component } from 'svelte';
	import type { DecodedActionData } from '$lib/types/transaction';

	const context = getContext<UnicoveContext>('state');

	interface Props {
		action: Action;
		datetime?: Date;
		decoded?: DecodedActionData;
		id?: Checksum256Type;
		notified?: Name[];
		summary?: Component<any, {}>;
		variant?: ActionDisplayVariants;
	}

	let {
		action,
		datetime,
		decoded,
		id,
		notified,
		summary: Summary,
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
		{JSON.stringify(action, null, 2)}
	</Code>
{/snippet}

{#snippet Decoded()}
	<Code>
		{#await decode()}
			Loading...
		{:then decoded}
			{JSON.stringify(decoded, null, 2)}
		{:catch error}
			{error.message}
			{JSON.stringify(action, null, 2)}
		{/await}
	</Code>
{/snippet}

{#snippet Pretty(data: DecodedActionData | undefined)}
	{#if data}
		{#each Object.keys(data) as key}
			{@render KeyValue(key, data[key])}
		{/each}
	{:else}
		<div class="text-muted">No decoded data</div>
	{/if}
{/snippet}

<div>
	<div class="bg-mineShaft-900 p-4">
		{#if id}
			<div>Transaction: <Transaction {id} /></div>
		{/if}
		{#if datetime}
			<div>Date/Time: {datetime}</div>
		{/if}
		Contract:
		<Contract name={action.account} action={action.name}>
			{action.name}
		</Contract>
		/ Action: <Contract name={action.account} />

		<p>
			Auths:
			{#each action.authorization as auth}
				<Account name={Name.from(auth.actor)}>
					{PermissionLevel.from(auth)}
				</Account>
			{/each}

			{#if notified}
				/ Notifications:
				{#each notified as account}
					<Account name={Name.from(account)} />
				{/each}
			{/if}
			/ Mode: {variant}
		</p>
	</div>
	<div class="bg-mineShaft-950 p-4">
		{#if variant === 'summary'}
			{#if decoded && Summary}
				<Summary action={{ data: decoded }} />
			{:else}
				{@render Pretty(decoded)}
			{/if}
		{:else if variant === 'pretty'}
			{@render Pretty(decoded)}
		{:else if variant === 'decoded'}
			{@render Decoded()}
		{:else if variant === 'json'}
			{@render Json()}
		{/if}
	</div>
</div>
