<script lang="ts">
	import { transactions } from '$lib/wharf/transact.svelte';
	import type { Checksum256 } from '@wharfkit/antelope';
	import Transaction from './elements/transaction.svelte';

	const { transactionId }: { transactionId: Checksum256 | string } = $props();

	const transaction = $derived(
		transactions.find((t) => t.transaction?.id.equals(String(transactionId)))
	);
</script>

<!-- TODO: Color audit -->
<div class="space-y-4 rounded-lg p-4">
	{#if transaction}
		<h2 class="h2">Transaction Complete</h2>
		<h3 class="h3">{transaction.status}</h3>
		<p>
			<Transaction id={transactionId} />
		</p>
	{:else}
		<h2 class="h2">Transaction Not Found</h2>
		<p>The transaction with ID {transactionId} could not be found.</p>
	{/if}
</div>
