<script lang="ts">
	import { getContext } from 'svelte';
	import { Checksum256, Asset } from '@wharfkit/antelope';

	import { getSetting } from '$lib/state/settings.svelte.js';
	import type { UnicoveContext } from '$lib/state/client.svelte';

	import SummaryBuyRAM from '$lib/components/summary/eosio/buyram.svelte';

	import Button from '$lib/components/button/button.svelte';
	import Code from '$lib/components/code.svelte';
	import Label from '$lib/components/input/label.svelte';
	import Stack from '$lib/components/layout/stack.svelte';
	import Transaction from '$lib/components/transaction.svelte';
	import AssetInput from '$lib/components/input/asset.svelte';

	import { BuyRAMState } from '../state.svelte.js';

	const context = getContext<UnicoveContext>('state');
	const { data } = $props();
	const debugMode = getSetting('debug-mode', false);

	const buyRamState: BuyRAMState = $state(new BuyRAMState(data.network.chain));

	buyRamState.format = 'asset';

	let transactionId: Checksum256 | undefined = $state();
	let assetInput: AssetInput | undefined = $state();

	async function handleBuyRAM() {
		if (!context.wharf || !context.wharf.session) {
			alert('Not logged in');
			return;
		}

		try {
			const transactionResult = await context.wharf.transact({
				action: data.network.contracts.system.action('buyram', buyRamState.toJSON())
			});

			transactionId = transactionResult.resolved?.transaction.id;

			resetState();
		} catch (error) {
			console.error(error);
		}
	}

	function resetState() {
		buyRamState.reset();
		assetInput?.set(null);
	}

	$effect(() => {
		if (context.account) {
			if (context.account.name) {
				buyRamState.payer = context.account.name;
				buyRamState.receiver = context.account.name;
			}

			if (context.account.balance) {
				buyRamState.balance = context.account.balance?.liquid;
			}
		}
	});

	$effect(() => {
		if (data.network.ramprice) {
			buyRamState.pricePerKB = data.network.ramprice.eos;
		}
	});
</script>

{#if transactionId}
	<Transaction network={data.network} {transactionId} />
{/if}

<form on:submit|preventDefault={handleBuyRAM}>
	<Stack class="gap-3">
		<Label for="assetInput">Amount to buy</Label>
		<AssetInput
			id="assetInput"
			bind:this={assetInput}
			bind:value={buyRamState.tokens}
			placeholder="0.0000 EOS"
			autofocus
		/>
		{#if buyRamState.insufficientBalance}
			<p class="text-red-500">Insufficient balance. Please enter a smaller amount.</p>
		{/if}
		<p>
			Balance available:
			{#if context.account}
				{context.account.balance?.liquid}
			{:else}
				0.0000 {data.network.chain.systemToken.symbol.code}
			{/if}
		</p>
	</Stack>

	<Stack class="mt-4 gap-3">
		<h3 class="h3">Details</h3>
		<div class="grid grid-cols-2 gap-2">
			<span>Price for 1000 Bytes:</span>
			<span>{buyRamState.pricePerKB} / KB</span>
			<span>Estimated Bytes:</span>
			<span>{buyRamState.bytesToBuy} Bytes</span>
			<span>Network Fee (0.5%)</span>
			<span>{buyRamState.fee}</span>
			<span>Total Cost</span>
			<span>{buyRamState.bytesCost}</span>
		</div>
		{#if buyRamState.valid}
			<SummaryBuyRAM action={{ data: buyRamState.toJSON() }} />
		{/if}
	</Stack>

	<Button type="submit" class="mt-4 w-full" disabled={!buyRamState.valid}>Confirm Buy RAM</Button>

	{#if debugMode.value}
		<h3 class="h3">Debugging</h3>
		<Code
			>{JSON.stringify(
				{
					payer: buyRamState.payer,
					receiver: buyRamState.receiver,
					tokens: buyRamState.tokens,
					balance: buyRamState.balance,
					chain: buyRamState.chain,
					pricePerKB: buyRamState.pricePerKB,
					estimatedBytes: buyRamState.bytes,
					valid: buyRamState.valid,
					insufficientBalance: buyRamState.insufficientBalance,
					balances: context.account?.balances
				},
				undefined,
				2
			)}</Code
		>
	{/if}
</form>
