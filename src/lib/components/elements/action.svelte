<script lang="ts">
	import {
		Action,
		Name,
		PermissionLevel,
		Serializer,
		type AnyAction,
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
		id?: Checksum256Type;
		variant?: ActionDisplayVariants;
	}

	let { action, id, variant = 'json' }: Props = $props();

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

<div>
	<div>
		{#if id}
			Transaction: <Transaction {id} />
		{/if}
	</div>
	<div>
		<Contract name={action.account} action={action.name}>
			{action.name}
		</Contract>
		-
		<Contract name={action.account} />
	</div>
	<div>
		{#if variant === 'summary'}
			summary not implemented
		{:else if variant === 'ricardian'}
			ricardian not implemented
		{:else if variant === 'pretty'}
			{#each Object.keys(action.data) as key}
				<div>
					{key}
				</div>
			{/each}
		{:else if variant === 'decoded'}
			<Code>
				{#await decode()}
					Loading...
				{:then decoded}
					{JSON.stringify(decoded, null, 2)}
				{:catch}
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
