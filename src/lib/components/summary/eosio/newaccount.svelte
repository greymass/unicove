<script lang="ts">
	import { Name } from '@wharfkit/session';

	import type { ActionSummaryProps } from '$lib/types/transaction';
	import * as SystemContract from '$lib/wharf/contracts/system';

	import AccountElement from '$lib/components/elements/account.svelte';
	import Key from '$lib/components/elements/key.svelte';
	import Row from '../components/row.svelte';

	interface Props extends Omit<ActionSummaryProps, 'data'> {
		data: SystemContract.Types.newaccount;
	}

	const { data }: Props = $props();
</script>

<Row>
	<AccountElement name={Name.from(data.creator)} />
	creates account
	<AccountElement name={Name.from(data.name)} />
</Row>

<Row>
	{#each data.owner.accounts as account}
		<span> Key </span>
		<span> Owner</span>
		{account.permission}
		<span>Weight: {account.weight}</span>
	{/each}
	{#each data.owner.keys as key}
		<span> Key </span>
		<span> Owner</span>
		<Key key={key.key} />
		<span>Weight: {key.weight}</span>
	{/each}
	{#each data.owner.waits as wait}
		<span> Key </span>
		<span> Owner</span>
		{wait.wait_sec} seconds
		<span>Weight: {wait.weight}</span>
	{/each}
</Row>

<Row>
	{#each data.active.accounts as account}
		<span> Key </span>
		<span> Active</span>
		{account.permission}
		<span>Weight: {account.weight}</span>
	{/each}
	{#each data.active.keys as key}
		<span> Key </span>
		<span> Active</span>
		<Key key={key.key} />
		<span>Weight: {key.weight}</span>
	{/each}
	{#each data.active.waits as wait}
		<span> Key </span>
		<span> Active</span>
		{wait.wait_sec} seconds
		<span>Weight: {wait.weight}</span>
	{/each}
</Row>
