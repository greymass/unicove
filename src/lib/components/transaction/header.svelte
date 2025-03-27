<script lang="ts">
	import { Card } from '$lib/components/layout';
	import type { TransactionResponse } from '$lib/types/transaction';
	import Block from '../elements/block.svelte';
	import Contract from '../elements/contract.svelte';
	import DateTime from '../elements/datetime.svelte';
	import { DD, DL, DLRow } from '$lib/components/descriptionlist';

	interface TransactionHeaderProps {
		transaction: TransactionResponse;
	}

	const { transaction }: TransactionHeaderProps = $props();
</script>

<Card>
	<DL>
		<DLRow
			title="Finality Status"
			description={transaction.irreversible ? 'Irreversible' : 'Reversible'}
		></DLRow>
		<DLRow title="Date">
			<DD>
				<DateTime datetime={transaction.block_time.toDate()} />
			</DD>
		</DLRow>
		<DLRow title="Transaction ID" description={transaction.id.toString()}></DLRow>
		<DLRow title="Included in Block">
			<DD>
				<Block number={transaction.block_num} />
			</DD>
		</DLRow>
		<DLRow title="Contracts Used">
			<DD class="layout-cluster justify-end">
				{#each transaction.contracts as contract}
					<Contract name={contract} />
				{/each}
			</DD>
		</DLRow>
	</DL>
</Card>
