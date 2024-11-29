<script lang="ts">
	import { Stack, Switcher } from '$lib/components/layout';
	import Button from '$lib/components/button/button.svelte';
	import TransactionSummary from '$lib/components/transactionSummary.svelte';

	import type { UnicoveContext } from '$lib/state/client.svelte';
	import { getContext } from 'svelte';
	import { WithdrawManager } from './manager.svelte';
	import * as m from '$lib/paraglide/messages';

	const context = getContext<UnicoveContext>('state');
	const { data } = $props();

	let manager: WithdrawManager = $state(new WithdrawManager(data.network));

	$effect(() => {
		if (context.account) {
			manager.sync(data.network, context.account, context.wharf);
		}
	});
</script>

<Stack>
	{#if manager.txid}
		<TransactionSummary transactionId={manager.txid} />
	{:else if manager.error}
		<h2 class="h2">{m.common_transaction_error()}</h2>
		<p>{m.common_transaction_error_subtitle()}</p>
	{:else}
		<Switcher>
			<Stack class="gap-2">
				<h3 class="text-muted leading-none">{m.common_withdrawable_currently()}</h3>
				<p class="text-2xl font-bold text-white">{String(manager.total)}</p>
			</Stack>

			<Button disabled={!manager.total.value} onclick={() => manager.transact()} variant="primary"
				>{m.common_withdraw()}</Button
			>
		</Switcher>
	{/if}
</Stack>
