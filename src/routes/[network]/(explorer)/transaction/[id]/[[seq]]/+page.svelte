<script lang="ts">
	import type { PageData } from './$types';
	import * as m from '$lib/paraglide/messages.js';
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
	};

	export let data: PageData;
</script>

{#if data.transaction && data.transaction.trx}
	{#each data.transaction.trx.trx.actions as action}
		{@const summaryComponent = summaryMap[action.account][action.name]}
		{#if summaryComponent}
			<svelte:component this={summaryComponent} {action} />
		{:else}
			<p>Unknown action: {action.account}::{action.name}</p>
		{/if}
		<Code>{JSON.stringify(action, null, 2)}</Code>
	{/each}
{/if}

{#if data.seq}
	{@const trace = data.transaction.traces.find(
		(t) => String(t.receipt.global_sequence) === data.seq
	)}
	<Code>{JSON.stringify(trace, null, 2)}</Code>
{:else}
	<Code>{JSON.stringify(data.transaction, null, 2)}</Code>
{/if}
