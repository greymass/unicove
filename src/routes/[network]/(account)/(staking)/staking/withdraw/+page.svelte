<script lang="ts">
	import { Asset } from '@wharfkit/antelope';

	import PillGroup from '$lib/components/navigation/pillgroup.svelte';
	import { Card, Stack, Switcher } from '$lib/components/layout';
	import AssetInput from '$lib/components/input/asset.svelte';
	import Button from '$lib/components/button/button.svelte';
	import Label from '$lib/components/input/label.svelte';
	import PageHeader from '$lib/components/pageheader.svelte';
	import Transaction from '$lib/components/transaction.svelte';

	import * as m from '$lib/paraglide/messages.js';
	import type { UnicoveContext } from '$lib/state/client.svelte';
	import { getContext } from 'svelte';
	import { WithdrawState } from './state.svelte';
	import UnstakingBalances from '../unstaking.svelte';

	const context = getContext<UnicoveContext>('state');
	const { data } = $props();

	let withdrawState: WithdrawState = $state(new WithdrawState(data.network));

	$effect(() => {
		withdrawState.sync(data.network, context.account, context.wharf);
	});
</script>

{#if withdrawState.txid}
	<Transaction network={data.network} transactionId={withdrawState.txid} />
{:else if withdrawState.error}
	<div>
		<h2 class="h2">Transaction Error</h2>
		<p>There was an error submitting your transaction.</p>
	</div>
{:else}
	<Stack class="mx-auto max-w-5xl space-y-8">
		<Switcher>
			<PageHeader title="Currently Withdrawable" subtitle={withdrawState.total} inverted />
			<Button
				disabled={!withdrawState.total.value}
				onclick={() => withdrawState.transact()}
				variant="secondary"
				class="text-skyBlue-500">Withdraw</Button
			>
		</Switcher>
		<Switcher>
			<UnstakingBalances records={withdrawState.unstaking} />
		</Switcher>
	</Stack>
{/if}
