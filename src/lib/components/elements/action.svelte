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
	import { getContext } from 'svelte';

	const context = getContext<UnicoveContext>('state');

	interface Props {
		action: Action;
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		decoded?: Record<string, any>;
		id?: Checksum256Type;
		notified?: Name[];
		variant?: ActionDisplayVariants;
	}

	let { action, decoded, id, notified, variant = 'json' }: Props = $props();

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
	<div>
		<span class="text-muted">
			{#if isArray || isObject}
				{key}
			{:else}
				{key}:
			{/if}
		</span>
		{#if isArray}
			{#each value as v}
				{@render KeyValue('', v)}
			{:else}
				[]
			{/each}
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

<div>
	<div>
		{#if id}
			Transaction: <Transaction {id} />
		{/if}
	</div>
	<div class="bg-mineShaft-900 p-4">
		{#if id}
			<div>Transaction: <Transaction {id} /></div>
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
			summary not implemented
		{:else if variant === 'ricardian'}
			ricardian not implemented
		{:else if variant === 'pretty'}
			{#if decoded}
				{#each Object.keys(decoded) as key}
					{@render KeyValue(key, decoded[key])}
				{/each}
			{:else}
				<div class="text-muted">No decoded data</div>
			{/if}
		{:else if variant === 'decoded'}
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
		{:else if variant === 'json'}
			<Code>
				{JSON.stringify(action, null, 2)}
			</Code>
		{/if}
	</div>
	<div>
		{#each action.authorization as auth}
			<Account name={Name.from(auth.actor)}>
				{PermissionLevel.from(auth)}
			</Account>
		{/each}
	</div>
</div>
