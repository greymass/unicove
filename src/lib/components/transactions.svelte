<script lang="ts">
	import { StatusType, transactions } from '$lib/wharf/transact.svelte';

	const pendingStatuses = [StatusType.BROADCAST, StatusType.IN_BLOCK, StatusType.LOCALLY_APPLIED];
	const pending = $derived(transactions.filter((t) => pendingStatuses.includes(t.status)));

	const completeStatuses = [StatusType.IRREVERSIBLE, StatusType.ERROR];
	const complete = $derived(transactions.filter((t) => completeStatuses.includes(t.status)));
</script>

<h1>Pending Transactions</h1>

<table border="1">
	<tbody>
		{#each pending as transaction}
			<tr>
				<td>{transaction.status}</td>
				{#if transaction.transaction}
					<td><pre>{transaction.transaction.id}</pre></td>
				{:else}
					<td>{transaction.error}</td>
				{/if}
			</tr>
		{/each}
	</tbody>
</table>

<h1>Completed Transactions</h1>

<table border="1">
	<tbody>
		{#each complete as transaction}
			<tr>
				<td>{transaction.status}</td>
				{#if transaction.transaction}
					<td><pre>{transaction.transaction.id}</pre></td>
				{:else}
					<td>{transaction.error}</td>
				{/if}
			</tr>
		{/each}
	</tbody>
</table>
