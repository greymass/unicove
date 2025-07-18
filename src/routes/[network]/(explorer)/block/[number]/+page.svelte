<script lang="ts">
	import { MultiCard } from '$lib/components/layout';
	import { Stack, Switcher, Table, TD, TH, TR } from 'unicove-components';
	import TransactionText from '$lib/components/elements/transaction.svelte';
	import AccountText from '$lib/components/elements/account.svelte';
	import { Button } from 'unicove-components';
	import { ArrowLeftRight, ArrowRight, ArrowLeft } from '@lucide/svelte';
	import { DD, DL, DLRow } from 'unicove-components';
	import { goto } from '$lib/utils';
	import * as m from '$lib/paraglide/messages';

	let { data } = $props();

	const previousBlockLink = $derived(`/${data.network}/block/${Number(data.height) - 1}`);
	const nextBlockLink = $derived(`/${data.network}/block/${Number(data.height) + 1}`);

	const handleKeydown = (e: KeyboardEvent) => {
		// Don't do anything if search is open
		if (
			document.activeElement?.tagName === 'INPUT' ||
			document.activeElement?.tagName === 'TEXTAREA' ||
			document.activeElement?.getAttribute('contenteditable') === 'true'
		) {
			return;
		}

		if (e.key === 'ArrowRight') {
			goto(nextBlockLink);
		} else if (e.key === 'ArrowLeft') {
			goto(previousBlockLink);
		}
	};
</script>

<svelte:window on:keydown={handleKeydown} />

<MultiCard>
	{#snippet leftColumn()}
		{#if data.block.transactions}
			{@const transactions = data.block.transactions}
			<Stack id="transactions">
				<h2 class="text-title flex items-center gap-2">
					<ArrowLeftRight class="size-5" />
					{transactions.length}
					{transactions.length === 1
						? m.common_transaction_unit_single()
						: m.common_transaction_unit_multi()}
				</h2>

				{#if transactions.length}
					<Table>
						{#snippet thead()}
							<TH>{m.common_transaction()}</TH>
							<TH class="text-right">{m.common_actions()}</TH>
							<TH class="text-right">{m.common_cpu_us()}</TH>
							<TH class="text-right">{m.common_net_bytes()}</TH>
						{/snippet}

						{#each transactions as transaction}
							{#if transaction}
								{@const txID =
									typeof transaction.trx === 'string' ? transaction.trx : transaction.trx.id}
								<TR>
									<TD><TransactionText id={txID} /></TD>
									<TD class="text-right">{transaction.trx.transaction?.actions.length || 0}</TD>
									<TD class="text-right">{transaction.cpu_usage_us}</TD>
									<TD class="text-right">{Number(transaction.net_usage_words) * 8}</TD>
								</TR>
							{/if}
						{/each}
					</Table>
				{:else}
					<p>{m.common_no_transactions()}</p>
				{/if}
			</Stack>
		{/if}
	{/snippet}

	{#snippet rightColumn()}
		<Stack class="gap-4" id="details">
			<h2 class="text-title">{m.block_page_details()}</h2>

			<DL>
				<DLRow title={m.common_block_number()}>
					<DD>
						{data.details.blockNumber}
					</DD>
				</DLRow>
				<DLRow title={m.common_producer_name()}>
					<DD>
						<AccountText name={data.details.blockProducer} />
					</DD>
				</DLRow>
				<DLRow title={m.common_cpu_total()}>
					<DD>
						{data.details.totalCpu} μs
					</DD>
				</DLRow>
				<DLRow title={m.common_net_total()}>
					<DD>
						{data.details.totalNet * 8} Bytes
					</DD>
				</DLRow>
				<DLRow title={m.common_total_actions()}>
					<DD>
						{data.details.totalActions}
					</DD>
				</DLRow>
				<DLRow title={m.common_block_id()}>
					<DD>
						{data.details.blockId}
					</DD>
				</DLRow>
			</DL>

			<Switcher>
				{#if data.height > 1}
					<Button href={previousBlockLink} variant="secondary">
						<span class="inline-flex items-center gap-1">
							<ArrowLeft class="size-4" />
							{m.common_block_previous()}
						</span>
					</Button>
				{/if}
				<Button href={nextBlockLink} variant="secondary">
					<span class="inline-flex items-center gap-1">
						{m.common_block_next()}
						<ArrowRight class="size-4" />
					</span>
				</Button>
			</Switcher>
		</Stack>
	{/snippet}
</MultiCard>
