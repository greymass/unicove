<script lang="ts">
	import { StatusType, transactions } from '$lib/wharf/transact.svelte';

	const pending = $derived(transactions.filter((t) => t.status === StatusType.BROADCAST));
</script>

<h1>All</h1>

<table border="1">
	<tbody>
		{#each transactions as transaction}
			<tr>
				<td>{transaction.status}</td>
				<td><pre>{transaction.transaction.id}</pre></td>
			</tr>
		{/each}
	</tbody>
</table>

<h1>Pending Transactions</h1>

{#each pending as transaction}
	<div>
		<pre>{transaction.transaction.id}</pre>
	</div>
{/each}
