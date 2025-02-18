<script lang="ts">
	import {
		Action,
		Name,
		PermissionLevel,
		Serializer,
		type Checksum256Type
	} from '@wharfkit/antelope';
	import Code from '../code.svelte';
	import ActionElement from '$lib/components/elements/action.svelte';
	import Account from '$lib/components/elements/account.svelte';
	import Contract from '$lib/components/elements/contract.svelte';
	import type { ActionDisplayVariants } from '$lib/types';
	import Transaction from './transaction.svelte';
	import type { UnicoveContext } from '$lib/state/client.svelte';
	import { getContext } from 'svelte';
	import type { ActionTrace } from '$lib/types/transaction';

	const context = getContext<UnicoveContext>('state');

	interface Props {
		trace: ActionTrace;
		id?: Checksum256Type;
		variant?: ActionDisplayVariants;
	}

	let { trace, id, variant = 'json' }: Props = $props();

	const action = trace.action;

	async function decode() {
		if (!context.network.abis) return;
		const abi = await context.network.abis?.getAbi(action.account);
		const test = Action.from(action, abi);
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
	<div class="bg-mineShaft-900 p-4">
		{#if id}
			<div>Transaction: <Transaction {id} /></div>
		{/if}
		<Contract name={action.account} action={action.name}>
			{action.name}
		</Contract>
		-
		<Contract name={action.account} />
	</div>
	<div class="bg-mineShaft-950 p-8">
		<div>Mode: {variant}</div>
		<div>
			{#if variant === 'summary'}
				summary not implemented
			{:else if variant === 'ricardian'}
				ricardian not implemented
			{:else if variant === 'pretty'}
				{#each Object.keys(trace.act.data) as key}
					{@render KeyValue(key, trace.act.data[key])}
				{/each}
			{:else if variant === 'decoded' || variant === 'json'}
				<ActionElement {action} {variant} />
			{/if}
		</div>
	</div>
	<div class="p-4">
		Auths:
		{#each action.authorization as auth}
			<Account name={Name.from(auth.actor)}>
				{PermissionLevel.from(auth)}
			</Account>
		{/each}
	</div>
</div>
