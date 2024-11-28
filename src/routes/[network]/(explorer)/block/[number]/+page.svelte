<script lang="ts">
	import { Card, Cluster } from '$lib/components/layout';
	import TransactionElement from '$lib/components/elements/transaction.svelte';
	import { Transaction } from '@wharfkit/antelope';
	import Button from '$lib/components/button/button.svelte';
	import ArrowRightLeft from 'lucide-svelte/icons/arrow-right-left';
	import ChevronRight from 'lucide-svelte/icons/chevron-right';
	import { truncateCenter } from '$lib/utils';

	const { data } = $props();

	const totalTransactionCount = $derived(
		data.block.transactions.filter(
			(item: { trx: { transaction: Transaction } }) => item.trx?.transaction
		).length
	);

	const deails: string[][] = $derived.by(() => {
		const items: string[][] = [];
		const result = data.block.transactions.reduce(
			(
				acc: { cpuCount: number; netCount: number; actionCount: number },
				tx: { cpu_usage_us: number; net_usage_words: number; trx: { transaction: Transaction } }
			) => {
				acc.cpuCount += tx.cpu_usage_us;
				acc.netCount += tx.net_usage_words * 8;
				acc.actionCount += tx.trx.transaction ? tx.trx.transaction.actions.length : 0;
				return acc;
			},
			{ cpuCount: 0, netCount: 0, actionCount: 0 }
		);
		items.push(['Total Block CPU', `${result.cpuCount} μs`]);
		items.push(['Total Block NET', `${result.netCount} Bytes`]);
		items.push(['Total Actions', `${result.actionCount}`]);
		items.push(['Block ID', `${data.block.id}`]);
		return items;
	});
</script>

<div class="gap-6 *:mb-6 *:w-full *:break-inside-avoid last:*:mb-0 @4xl:columns-2">
	<Card class="text-muted gap-0 bg-transparent py-0">
		<div class="flex items-center gap-2 py-2 text-white">
			<ArrowRightLeft class="size-4" />
			<h3 class="text-xl font-semibold">{totalTransactionCount} Transations</h3>
		</div>

		<div class="grid grid-cols-[1.5fr,1fr,1fr,1fr,0.5fr] py-3">
			<div>Tx ID</div>
			<div>Actions</div>
			<div>CPU</div>
			<div>NET</div>
			<div></div>
		</div>

		<div>
			{#if totalTransactionCount}
				{#each data.block.transactions as transaction}
					{#if transaction}
						<a
							href="/{data.network}/transaction/{String(transaction.trx.id)}"
							class="table-row-border table-row-background group grid grid-cols-[1.5fr,1fr,1fr,1fr,0.5fr] py-3"
						>
							<div>
								<span class="text-skyBlue-500 hover:text-skyBlue-400"
									>{truncateCenter(String(transaction.trx.id))}</span
								>
							</div>
							<div>
								{transaction.trx.transaction.actions.length}
							</div>
							<div>{transaction.cpu_usage_us} μs</div>
							<div>{transaction.net_usage_words * 8} Bytes</div>
							<div class="flex items-center justify-center text-white">
								<ChevronRight class="size-6 group-hover:stroke-skyBlue-400" />
							</div>
						</a>
					{/if}
				{/each}
			{:else}
				<div
					class="table-row-border table-row-background group grid grid-cols-[1.5fr,1fr,1fr,1fr,0.5fr] py-3"
				>
					<div>-</div>
					<div>-</div>
					<div>-</div>
					<div>-</div>
					<div></div>
				</div>
			{/if}
		</div>
	</Card>

	<Card class="gap-0 bg-transparent py-0">
		<div class="py-2">
			<h3 class="text-xl font-semibold">{data.title} details</h3>
		</div>
		<table class="table-styles">
			<tbody>
				<tr>
					<td width="40%" class="text-muted break-all align-top">Producter Name: </td>
					<td width="60%" class="break-all align-top">
						<a
							class="text-skyBlue-500 hover:text-skyBlue-400"
							href="/{data.network}/account/{data.block.producer}">{data.block.producer}</a
						></td
					>
				</tr>
				{#each deails as detail}
					<tr>
						<td width="40%" class="text-muted break-all align-top">{detail[0]}: </td>
						<td width="60%" class="break-all align-top">{detail[1]}</td>
					</tr>
				{/each}
			</tbody>
		</table>
		<Cluster class="mt-8">
			<Button href="/{data.network}/block/{Number(data.height) - 1}" variant="secondary"
				>← Previous Block</Button
			>
			<Button href="/{data.network}/block/{Number(data.height) + 1}" variant="secondary"
				>Next Block →</Button
			>
		</Cluster>
	</Card>
</div>
