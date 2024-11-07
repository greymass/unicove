<script lang="ts">
	import { Card, Stack, Switcher } from '$lib/components/layout';
	import Button from '$lib/components/button/button.svelte';
	import PageHeader from '$lib/components/pageheader.svelte';
	import Transaction from '$lib/components/transaction.svelte';

	import type { UnicoveContext } from '$lib/state/client.svelte';
	import { getContext } from 'svelte';
	import { WithdrawManager } from './manager.svelte';
	import UnstakingBalances from '../unstaking.svelte';

	const context = getContext<UnicoveContext>('state');
	const { data } = $props();

	let manager: WithdrawManager = $state(new WithdrawManager(data.network));

	$effect(() => {
		if (context.account) {
			manager.sync(data.network, context.account, context.wharf);
		}
	});
</script>

{#if manager.txid}
	<Transaction network={data.network} transactionId={manager.txid} />
{:else if manager.error}
	<div>
		<h2 class="h2">Transaction Error</h2>
		<p>There was an error submitting your transaction.</p>
	</div>
{:else}
	<Card>
		<Stack class="mx-auto max-w-5xl space-y-8">
			<Switcher>
				<PageHeader title="Currently Withdrawable" subtitle={String(manager.total)} inverted />
				<Button
					disabled={!manager.total.value}
					onclick={() => manager.transact()}
					variant="secondary"
					class="text-skyBlue-500">Withdraw</Button
				>
			</Switcher>
			<Switcher>
				<UnstakingBalances records={manager.unstaking} />
			</Switcher>
		</Stack>
	</Card>
{/if}
