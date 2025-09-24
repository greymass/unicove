<script lang="ts">
	import type { TransactionResponse } from '$lib/types/transaction';
	import Block from '$lib/components/elements/block.svelte';
	import Contract from '../elements/contract.svelte';
	import { Number } from 'unicove-components';
	import { DateTime } from 'unicove-components';
	import { DD, DL, DLRow } from 'unicove-components';

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
		<DD class="flex flex-wrap justify-end gap-4">
			{#each transaction.contracts as contract}
				<Contract name={contract} />
			{/each}
		</DD>
	</DLRow>
	<DLRow title={m.common_cpu_us()}>
		<DD>
			<Number number={transaction.trx.receipt.cpu_usage_us} />
		</DD>
	</DLRow>
	<DLRow title={m.common_net_bytes()}>
		<DD>
			<Number number={transaction.trx.receipt.net_usage_words.multiplying(8)} />
		</DD>
	</DLRow>
</DL>
