<script lang="ts">
	import { getContext } from 'svelte';
	import { Asset, Checksum256 } from '@wharfkit/antelope';

	import { getSetting } from '$lib/state/settings.svelte.js';
	import type { UnicoveContext } from '$lib/state/client.svelte';

	import Button from '$lib/components/button/button.svelte';
	import Code from '$lib/components/code.svelte';
	import Label from '$lib/components/input/label.svelte';
	import Stack from '$lib/components/layout/stack.svelte';
	import Transaction from '$lib/components/transaction.svelte';

	import { BuyRAMState } from './state.svelte.js';
	import AssetOrUnitsInput from '$lib/components/input/assetOrUnits.svelte';

	const context = getContext<UnicoveContext>('state');
	const { data } = $props();
	const debugMode = getSetting('debug-mode', false);

	const buyRamState: BuyRAMState = $state(new BuyRAMState(data.network.chain));

	let transactionId: Checksum256 | undefined = $state();

	async function handleBuyRAM() {
		if (!context.wharf || !context.wharf.session) {
			alert('Not logged in');
			return;
		}

		const actionName = buyRamState.format === 'asset' ? 'buyram' : 'buyrambytes';

		try {
			const transactionResult = await context.wharf.transact({
				action: data.network.contracts.system.action(actionName, buyRamState.toJSON())
			});

			transactionId = transactionResult?.resolved?.transaction.id;
		} catch (error) {
			console.error(error);
		}
	}

	function preventDefault(fn: (event: Event) => void) {
		return function (event: Event) {
			event.preventDefault();
			fn.call(this, event);
		};
	}

	$effect(() => {
		if (context.account) {
			if (context.account.name) {
				buyRamState.payer = context.account.name;
				buyRamState.receiver = context.account.name;
			}

			if (data.network.chain.systemToken) {
				buyRamState.balance = Asset.from(
					context.account.balance?.liquid?.value || 0,
					data.network.chain.systemToken.symbol
				);
			}
		}
	});

	$effect(() => {
		if (data.network.ramprice) {
			buyRamState.pricePerKB = data.network.ramprice.eos;
		}
	});

	$effect(() => {
		if (buyRamState.format) {
			buyRamState.reset();
		}
	});
</script>

{#if transactionId}
	<Transaction network={data.network} {transactionId} />
{/if}

<form onsubmit={preventDefault(handleBuyRAM)}>
	<Stack class="gap-3">
		<Label for="assetInput">Amount (in bytes)</Label>
		<AssetOrUnitsInput
			bind:assetValue={buyRamState.tokens}
			bind:unitsValue={buyRamState.bytes}
			unitName="Bytes"
			bind:format={buyRamState.format}
			autofocus
		/>
		{#if buyRamState.insufficientBalance}
			<p class="text-red-500">Insufficient balance. Please enter a smaller amount.</p>
		{/if}
		<p>
			Available:
			{#if context.account}
				{context.account.balance?.liquid}
			{:else}
				0.0000 {data.network.chain.systemToken}
			{/if}
		</p>
	</Stack>

	<Stack class="mt-4 gap-3">
		<h3 class="h3">Details</h3>
		<div class="grid grid-cols-2 gap-2">
			<span>Price for 1000 Bytes:</span>
			<span>{buyRamState.pricePerKB} / KB</span>
			<span>Price{buyRamState.bytes ? ` for ${buyRamState.bytes} Bytes` : ''}:</span>
			<span>{buyRamState.bytesValue}</span>
			<span>Network Fee (0.5%)</span>
			<span>{buyRamState.fee}</span>
			<span>Total Cost</span>
			<span>{buyRamState.bytesCost}</span>
		</div>
	</Stack>

	<Button type="submit" class="mt-4 w-full" disabled={!buyRamState.valid}>Confirm Buy RAM</Button>

	{#if debugMode.value}
		<h3 class="h3">Debugging</h3>
		<Code
			>{JSON.stringify(
				{
					payer: buyRamState.payer,
					receiver: buyRamState.receiver,
					bytes: buyRamState.bytes,
					balance: buyRamState.balance,
					chain: buyRamState.chain,
					pricePerKB: buyRamState.pricePerKB,
					pricePerByte: buyRamState.pricePerByte,
					bytesValue: buyRamState.bytesValue,
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
