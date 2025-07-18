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
	import { DD, DL, DLRow } from '../descriptionlist';

	const context = getContext<UnicoveContext>('state');

	interface Props {
		transactionId?: Checksum256 | string;
		hidden?: boolean;
		onsuccess?: () => ReturnType<import('svelte').Snippet>;
	}

	const { transactionId, hidden, onsuccess }: Props = $props();

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
					<ClipboardPen class="text-success size-full" />
				</picture>
				<h3 class="h3">{m.common_msig_proposal_created()}</h3>
				<p class="text-center">
					{m.common_msig_proposal_description()}
				</p>
				{#each proposals as proposal}
					<Button href="/{context.network}/msig/{proposal.proposer}/{proposal.proposal_name}">
						{m.common_view_proposal()} ({proposal.proposer}/{proposal.proposal_name})
					</Button>
				{/each}
			{:else}
				<picture class="size-24">
					<CircleCheckBig class="text-success size-full" />
				</picture>
				<h3 class="h3 text-center">
					{m.common_transaction_complete()}
				</h3>
			{/if}
		</div>

		<DL class="bg-surface-container rounded-xl p-4 font-mono">
			<DLRow title={m.common_status()}>
				<DD>{transaction.status}</DD>
			</DLRow>
			{#if transaction.transaction}
				<DLRow title={m.common_trx_id()}>
					<DD><Transaction id={transaction.transaction.id} /></DD>
				</DLRow>
			{/if}
		</DL>
	{:else}
		<h2 class="h2">{m.common_trx_not_found()}</h2>
		<p>{m.common_trx_not_found_description({ transactionId: String(transactionId) })}</p>
	{/if}
	{#if onsuccess}
		{@render onsuccess()}
	{/if}
</div>
