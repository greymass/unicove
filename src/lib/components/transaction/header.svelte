<script lang="ts">
	import type { TransactionResponse } from '$lib/types/transaction';
	import Block from '../elements/block.svelte';
	import Contract from '../elements/contract.svelte';
	import DateTime from '../elements/datetime.svelte';
	import { DD, DL, DLRow } from '$lib/components/descriptionlist';

	import * as m from '$lib/paraglide/messages';

	interface TransactionHeaderProps {
		transaction: TransactionResponse;
	}

	const { transaction }: TransactionHeaderProps = $props();
</script>

<DL>
	<DLRow
		title={m.common_finality_status()}
		description={transaction.irreversible ? m.common_irreversible() : m.common_reversible()}
	></DLRow>
	<DLRow title={m.common_date()}>
		<DD>
			<DateTime datetime={transaction.block_time.toDate()} />
		</DD>
	</DLRow>
	<DLRow title={m.common_transaction_id()} description={transaction.id.toString()}></DLRow>
	<DLRow title={m.common_included_in_block()}>
		<DD>
			<Block number={transaction.block_num} />
		</DD>
	</DLRow>
	<DLRow title={m.common_contracts_used()}>
		<DD class="layout-cluster justify-end">
			{#each transaction.contracts as contract}
				<Contract name={contract} />
			{/each}
		</DD>
	</DLRow>
</DL>
