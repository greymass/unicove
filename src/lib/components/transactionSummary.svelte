<script lang="ts">
	import { transactions } from '$lib/wharf/transact.svelte';
	import type { Checksum256 } from '@wharfkit/antelope';
	import Transaction from './elements/transaction.svelte';
	import CircleCheckBig from 'lucide-svelte/icons/circle-check-big';

	interface Props {
		transactionId?: Checksum256 | string;
		hidden?: boolean;
	}

	const { transactionId, hidden }: Props = $props();

	const transaction = $derived(
		transactions.find((t) => t.transaction?.id.equals(String(transactionId)))
	);
</script>

<div class="space-y-6 rounded-lg" class:hidden>
	{#if transaction}
		<div class="flex flex-col items-center gap-6">
			<picture class="size-24">
				<CircleCheckBig class="size-full text-green-300" />
			</picture>
			<h2 class="h3">Transaction Complete</h2>
		</div>
		<!-- <h3 class="h3">{transaction.status}</h3> -->
		<table class="table-styles">
			<tbody>
				<tr>
					<td>Status</td>
					<td class="text-right">{transaction.status}</td>
				</tr>
				<tr>
					<td>Transaction ID</td>
					<td class="text-right"><Transaction id={transaction.transaction?.id} /> </td>
				</tr>
			</tbody>
		</table>
	{:else}
		<h2 class="h2">Transaction Not Found</h2>
		<p>The transaction with ID {transactionId} could not be found.</p>
	{/if}
</div>
