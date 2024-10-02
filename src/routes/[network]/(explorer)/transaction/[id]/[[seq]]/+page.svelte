<script lang="ts">
	import type { PageData } from './$types';
	import Code from '$lib/components/code.svelte';

	import SendSummary from '$lib/components/summary/eosio.token/transfer.svelte';
	import DepositSummary from '$lib/components/summary/eosio/deposit.svelte';
	import WithdrawSummary from '$lib/components/summary/eosio/withdraw.svelte';
	import BuyREXSummary from '$lib/components/summary/eosio/buyrex.svelte';
	import SellREXSummary from '$lib/components/summary/eosio/sellrex.svelte';
	import MvfrsavingsSummary from '$lib/components/summary/eosio/mvfrsavings.svelte';

	const summaryMap = {
		'eosio.token': {
			transfer: SendSummary
		},
		eosio: {
			deposit: DepositSummary,
			withdraw: WithdrawSummary,
			buyrex: BuyREXSummary,
			sellrex: SellREXSummary,
			mvfrsavings: MvfrsavingsSummary
		}
	} as const;

	export let data: PageData;

	import type { SvelteComponent } from 'svelte';

	// Define the Action interface
	interface Action {
		account: string;
		name: string;
		data: Record<string, unknown>;
	}

	// Type guard for account
	function isValidAccount(account: string): account is keyof typeof summaryMap {
		return account in summaryMap;
	}

	// Type guard for action name
	function isValidActionName(
		account: keyof typeof summaryMap,
		name: string
	): name is keyof (typeof summaryMap)[typeof account] {
		return name in summaryMap[account];
	}
</script>

{#if data.transaction && data.transaction.trx}
	{@const actions = data.transaction.trx.trx.actions as Action[]}
	{#each actions as action}
		{#if isValidAccount(action.account)}
			{@const accountMap = summaryMap[action.account]}
			{#if isValidActionName(action.account, action.name)}
				{@const summaryComponent = accountMap[action.name]}
				<svelte:component this={summaryComponent as typeof SvelteComponent} {action} />
			{:else}
				<p>Unknown action: {action.account}::{action.name}</p>
			{/if}
		{:else}
			<p>Unknown account: {action.account}</p>
		{/if}
		<Code>{JSON.stringify(action, null, 2)}</Code>
	{/each}
{/if}

{#if data.seq}
	{@const trace = data.transaction.traces.find(
		(t: { receipt: { global_sequence: number } }) => String(t.receipt.global_sequence) === data.seq
	)}
	<Code>{JSON.stringify(trace, null, 2)}</Code>
{:else}
	<Code>{JSON.stringify(data.transaction, null, 2)}</Code>
{/if}
