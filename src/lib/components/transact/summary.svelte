<script lang="ts">
	import { transactions } from '$lib/wharf/transact.svelte';
	import { Serializer, type Checksum256 } from '@wharfkit/antelope';
	import Transaction from '$lib/components/elements/transaction.svelte';
	import CircleCheckBig from 'lucide-svelte/icons/circle-check-big';
	import ClipboardPen from 'lucide-svelte/icons/clipboard-pen';
	import * as m from '$lib/paraglide/messages';
	import type { UnicoveContext } from '$lib/state/client.svelte';
	import { getContext } from 'svelte';

	import { Types as MsigTypes } from '$lib/wharf/contracts/msig';
	import Button from '$lib/components/button/button.svelte';

	const context = getContext<UnicoveContext>('state');

	interface Props {
		transactionId?: Checksum256 | string;
		hidden?: boolean;
	}

	const { transactionId, hidden }: Props = $props();

	const transaction = $derived(
		transactions.find((t) => t.transaction?.id.equals(String(transactionId)))
	);

	const proposals = $derived(
		transaction?.transaction?.actions
			.filter((a) => a.name.equals('propose') && a.account.equals('eosio.msig'))
			.map((p) => {
				return Serializer.decode({
					data: p.data,
					type: MsigTypes.propose
				});
			})
	);
</script>

<div class="space-y-6 rounded-lg" class:hidden>
	{#if transaction}
		<div class="flex flex-col items-center gap-6">
			{#if proposals && proposals.length}
				<picture class="size-24">
					<ClipboardPen class="size-full text-green-300" />
				</picture>
				<h3 class="h3">Multi-Sig Proposal Created</h3>
				<p class="text-center">
					The multi-sig proposal for this transaction has been created and now needs to be approved.
					View the proposal below and share it with the parties who need to sign.
				</p>
				{#each proposals as proposal}
					<Button href="/{context.network}/msig/{proposal.proposer}/{proposal.proposal_name}">
						View Proposal ({proposal.proposer}/{proposal.proposal_name})
					</Button>
				{/each}
			{:else}
				<picture class="size-24">
					<CircleCheckBig class="size-full text-green-300" />
				</picture>
				<h3 class="h3">
					{m.common_transaction_complete()}
				</h3>
			{/if}
		</div>
		<!-- <h3 class="h3">{transaction.status}</h3> -->
		<table class="table-styles">
			<tbody>
				<tr>
					<td>{m.common_status()}</td>
					<td class="text-right">{transaction.status}</td>
				</tr>
				{#if transaction.transaction}
					<tr>
						<td>{m.common_trx_id()}</td>
						<td class="text-right"><Transaction id={transaction.transaction.id} /> </td>
					</tr>
				{/if}
			</tbody>
		</table>
	{:else}
		<h2 class="h2">{m.common_trx_not_found()}</h2>
		<p>{m.common_trx_not_found_description({ transactionId: String(transactionId) })}</p>
	{/if}
</div>
