<script lang="ts">
	import { Stack, Switcher } from '$lib/components/layout';
	import Button from '$lib/components/button/button.svelte';
	import TransactionSummary from '$lib/components/transactionSummary.svelte';

	import type { UnicoveContext } from '$lib/state/client.svelte';
	import { getContext } from 'svelte';
	import { RefundManager } from './manager.svelte';

	const context = getContext<UnicoveContext>('state');
	const { data } = $props();

	let manager: RefundManager = $state(new RefundManager(data.network));

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
				<h3 class="text-muted leading-none">Delegated Amount</h3>
				<p class="text-2xl font-bold text-white">{String(manager.account?.balance?.delegated)}</p>
			</Stack>

			<Button disabled={!manager.reclaimable} onclick={() => manager.transact()} variant="primary"
				>Reclaim</Button
			>
		</Switcher>
		<p>
			Note: Tokens that are undelegated will remain in a "refunding" state for 72 hours, after which
			they will need to be claimed from your account page.
		</p>
	{/if}
</Stack>
