<script lang="ts">
	import { Stack, Switcher } from 'unicove-components';
	import { Button } from 'unicove-components';
	import TransactSummary from '$lib/components/transact/summary.svelte';
	import TransactError from '$lib/components/transact/error.svelte';

	import type { UnicoveContext } from '$lib/state/client.svelte';
	import { getContext } from 'svelte';
	import { WithdrawManager } from './manager.svelte';
	import * as m from '$lib/paraglide/messages';
	import { Card } from 'unicove-components';

	const context = getContext<UnicoveContext>('state');
	const { data } = $props();

	let manager: WithdrawManager = $state(new WithdrawManager(data.network));

	$effect(() => {
		if (context.account) {
			manager.sync(data.network, context.account, context.wharf);
		}
	});

	function resetState() {
		manager = new WithdrawManager(data.network);
	}
</script>

<Stack>
	{#if manager.txid}
		<TransactSummary transactionId={manager.txid} />
		<Button href={`/${data.network}/staking`} variant="secondary">
			{m.search_result_description_staking()}
		</Button>
		<Button href={`/${data.network}/account/${context.account?.name}`}>
			{m.common_view_my_account()}
		</Button>
	{:else if manager.error}
		<TransactError error={manager.error} />
		<Button onclick={resetState}>{m.common_close()}</Button>
	{:else}
		<Switcher>
			<Stack class="gap-2">
				<h3 class="text-muted leading-none">{m.common_withdrawable_currently()}</h3>
				<p class="text-on-surface text-2xl font-bold">{String(manager.total)}</p>
			</Stack>
			<Button disabled={!manager.total.value} onclick={() => manager.transact()} variant="primary"
				>{m.common_withdraw()}</Button
			>
			{#if manager.voting && manager.sellingAll}
				<Card>
					<h4 class="h4 text-solar-500">Notice: Withdrawing will also clear votes</h4>
					<p>
						Withdrawing and removing all tokens from staking requires we unset any votes that were
						previously cast for either block producers or proxies.
					</p>
				</Card>
			{/if}
		</Switcher>
	{/if}
</Stack>
