<script lang="ts">
	import { Stack, Switcher } from '$lib/components/layout';
	import Button from '$lib/components/button/button.svelte';
	import TransactionSummary from '$lib/components/transactionSummary.svelte';

	import type { UnicoveContext } from '$lib/state/client.svelte';
	import { getContext } from 'svelte';
	import { WithdrawManager } from './manager.svelte';

	const context = getContext<UnicoveContext>('state');
	const { data } = $props();

	let manager: WithdrawManager = $state(new WithdrawManager(data.network));

	$effect(() => {
		if (context.account) {
			manager.sync(data.network, context.account, context.wharf);
		}
	});
</script>

<Stack>
	{#if manager.txid}
		<TransactionSummary transactionId={manager.txid} />
	{:else if manager.error}
		<h2 class="h2">Transaction Error</h2>
		<p>There was an error submitting your transaction.</p>
	{:else}
		<Switcher>
			<Stack class="gap-2">
				<h3 class="text-muted leading-none">Currently Withdrawable</h3>
				<p class="text-2xl font-bold text-white">{String(manager.total)}</p>
			</Stack>

			<Button disabled={!manager.total.value} onclick={() => manager.transact()} variant="primary"
				>Withdraw</Button
			>
		</Switcher>
	{/if}
</Stack>
