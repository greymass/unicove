<script lang="ts">
	import { Name, PermissionLevel, type AnyAction } from '@wharfkit/antelope';
	import Code from '../code.svelte';
	import Account from '$lib/components/elements/account.svelte';
	import Contract from '$lib/components/elements/contract.svelte';

	type VariantTypes = 'json';

	interface Props {
		action: AnyAction;
		variant?: VariantTypes;
	}

	let { action, variant = 'json' }: Props = $props();
</script>

<div>
	<div>
		<Contract name={action.account} action={action.name}>{action.name}</Contract>
		-
		<Contract name={action.account} />
	</div>
	<div>
		{#if variant === 'json'}
			<Code>
				{JSON.stringify(action.data, null, 2)}
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
