<script lang="ts">
	import { Stack, MultiCard, Switcher } from '$lib/components/layout';
	import TransactionText from '$lib/components/elements/transaction.svelte';
	import AccountText from '$lib/components/elements/account.svelte';
	import Button from '$lib/components/button/button.svelte';
	import { ArrowLeftRight, ArrowRight, ArrowLeft } from 'lucide-svelte';
	import { DL, DLRow } from '$lib/components/descriptionlist/index.js';

	let { data } = $props();
</script>

<MultiCard>
	{#if data.block.transactions}
		{@const transactions = data.block.transactions}
		<Stack id="transactions">
			<h2 class="h3 flex items-center gap-2">
				<ArrowLeftRight class="size-5" />
				{transactions.length}
				{transactions.length > 1 ? 'Transactions' : 'Transaction'}
			</h2>

			<table class="table-styles">
				<thead>
					<tr>
						<th>Transaction</th>
						<th class="text-right">Actions</th>
						<th class="text-right">CPU (μs)</th>
						<th class="text-right">NET (Bytes)</th>
					</tr>
				</thead>
				<tbody>
					{#each transactions as transaction}
						{#if transaction}
							{@const txID =
								typeof transaction.trx === 'string' ? transaction.trx : transaction.trx.id}
							<tr>
								<td><TransactionText id={txID} /></td>
								<td class="text-right">{transaction.trx.transaction?.actions.length || 0}</td>
								<td class="text-right">{transaction.cpu_usage_us}</td>
								<td class="text-right">{Number(transaction.net_usage_words) * 8}</td>
							</tr>
						{/if}
					{/each}
				</tbody>
			</table>
		</Stack>
	{/if}

	<Stack class="gap-4" id="details">
		<h2 class="h3">Block Details</h2>

		<DL>
			<DLRow title={'Block Number'}>
				{data.details.blockNumber}
			</DLRow>
			<DLRow title={'Producer Name'}>
				<AccountText name={data.details.blockProducer} />
			</DLRow>
			<DLRow title={'Total CPU'}>
				{data.details.totalCpu} μs
			</DLRow>
			<DLRow title={'Total NET'}>
				{data.details.totalNet * 8} Bytes
			</DLRow>
			<DLRow title={'Total Actions'}>
				{data.details.totalActions}
			</DLRow>
			<DLRow title={'Block ID'}>
				{data.details.blockId}
			</DLRow>
		</DL>

		<Switcher>
			{#if data.height > 1}
				<Button href="/{data.network}/block/{Number(data.height) - 1}" variant="secondary">
					<span class="inline-flex items-center gap-1">
						<ArrowLeft class="size-4" /> Previous Block
					</span>
				</Button>
			{/if}
			<Button href="/{data.network}/block/{Number(data.height) + 1}" variant="secondary">
				<span class="inline-flex items-center gap-1">
					Next Block <ArrowRight class="size-4" />
				</span>
			</Button>
		</Switcher>
	</Stack>
</MultiCard>
