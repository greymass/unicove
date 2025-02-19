<script lang="ts">
	import { Card } from '$lib/components/layout';
	import type { TransactionResponse } from '$lib/types/transaction';
	import Block from '../elements/block.svelte';
	import Contract from '../elements/contract.svelte';
	import DateTime from '../elements/datetime.svelte';

	interface TransactionHeaderProps {
		transaction: TransactionResponse;
	}

	const { transaction }: TransactionHeaderProps = $props();
</script>

<Card>
	<table class="table-styles">
		<tbody>
			<tr>
				<td>Finality Status</td>
				<td>{transaction.irreversible ? 'Irreversible' : 'Reversible'}</td>
			</tr>
			<tr>
				<td>Date</td>
				<td><DateTime datetime={transaction.block_time.toDate()} /></td>
			</tr>
			<tr>
				<td>Transaction ID</td>
				<td>{transaction.id}</td>
			</tr>
			<tr>
				<td>Included in block</td>
				<td>
					<Block number={transaction.block_num} />
				</td>
			</tr>
			<tr>
				<td>Contracts used</td>
				<td>
					<div class="flex gap-2">
						{#each transaction.contracts as contract}
							<Contract name={contract} />
						{/each}
					</div>
				</td>
			</tr>
		</tbody>
	</table>
</Card>
