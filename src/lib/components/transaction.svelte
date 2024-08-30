<script lang="ts">
	import { transactions } from '$lib/wharf/transact.svelte';

	const { transactionId, network } = $props();

	const transaction = $derived(transactions.find((t) => t.transaction?.id === transactionId));
</script>

<div class="space-y-4 rounded-lg border border-gray-300 p-4">
	<h2 class="h2">Transaction Complete</h2>
	<h3 class="h3">{transaction?.status}</h3>
	<p>
		<a href="/{network}/transaction/{transactionId}">
			{transactionId}
		</a>
	</p>
</div>
