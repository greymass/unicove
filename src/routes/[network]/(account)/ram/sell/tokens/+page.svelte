<script lang="ts">
	import { getContext } from 'svelte';
	import { Checksum256 } from '@wharfkit/antelope';

	import { getSetting } from '$lib/state/settings.svelte.js';
	import type { UnicoveContext } from '$lib/state/client.svelte';

	import Button from '$lib/components/button/button.svelte';
	import Code from '$lib/components/code.svelte';
	import Label from '$lib/components/input/label.svelte';
	import Stack from '$lib/components/layout/stack.svelte';
	import Transaction from '$lib/components/transaction.svelte';
	import AssetInput from '$lib/components/input/asset.svelte';

	import { SellRAMState } from '../state.svelte.js';

	const context = getContext<UnicoveContext>('state');
	const { data } = $props();
	const debugMode = getSetting('debug-mode', false);

	const sellRamState: SellRAMState = $state(new SellRAMState(data.network.chain));
	let assetInput: AssetInput | undefined = $state();

	let transactionId: Checksum256 | undefined = $state();

	async function handleSellRAM() {
		if (!context.wharf || !context.wharf.session) {
			alert('Not logged in');
			return;
		}

		try {
			const transactionResult = await context.wharf.transact({
				action: data.network.contracts.system.action('sellram', sellRamState.toJSON())
			});

			transactionId = transactionResult.resolved?.transaction.id;

			resetState();
		} catch (error) {
			console.error(error);
		}
	}

	function resetState() {
		sellRamState.reset();
		assetInput?.set(null);
	}

	$effect(() => {
		if (context.account) {
			if (context.account.name) {
				sellRamState.account = context.account.name;
			}
			sellRamState.max = Number(context.account.ram?.available || 0);
		}
	});

	$effect(() => {
		if (data.network.ramprice) {
			sellRamState.pricePerKB = data.network.ramprice.eos;
		}
	});
</script>

{#if transactionId}
	<Transaction network={data.network} {transactionId} />
{/if}

<form on:submit|preventDefault={handleSellRAM}>
	<Stack class="gap-3">
		<Label for="assetInput">Amount to sell</Label>
		<AssetInput
			id="assetInput"
			bind:this={assetInput}
			bind:value={sellRamState.tokens}
			placeholder="0.0000 EOS"
			autofocus
		/>
		{#if sellRamState.insufficientRAM}
			<p class="text-red-500">Insufficient RAM available. Please enter a smaller amount.</p>
		{/if}
		<p>
			Available RAM:
			{#if context.account}
				{sellRamState.max} Bytes
			{:else}
				0 Bytes
			{/if}
		</p>
		<p>
			Value of available RAM:
			{#if context.account}
				{sellRamState.maxValue}
			{:else}
				0 Bytes
			{/if}
		</p>
	</Stack>

	<Stack class="mt-4 gap-3">
		<h3 class="h3">Details</h3>
		<div class="grid grid-cols-2 gap-2">
			<span>Price for 1000 bytes:</span>
			<span>{sellRamState.pricePerKB} / KB</span>
			<span>Estimated RAM to be sold:</span>
			<span>{sellRamState.bytesToSell} Bytes</span>
			<span>RAM Value:</span>
			<span>{sellRamState.tokens}</span>
			<span>Network Fee (0.5%)</span>
			<span>{sellRamState.fee}</span>
			<span>Expected To Receive:</span>
			<span>~ {sellRamState.expectedToReceive}</span>
		</div>
	</Stack>

	<Button type="submit" class="mt-4 w-full" disabled={!sellRamState.valid}>Confirm Sell RAM</Button>

	{#if debugMode.value}
		<h3 class="h3">Debugging</h3>
		<Code
			>{JSON.stringify(
				{
					account: sellRamState.account,
					tokens: sellRamState.tokens,
					max: sellRamState.max,
					chain: sellRamState.chain,
					pricePerKB: sellRamState.pricePerKB,
					pricePerByte: sellRamState.pricePerByte,
					estimatedBytesToSell: sellRamState.bytes,
					insufficientRAM: sellRamState.insufficientRAM,
					valid: sellRamState.valid,
					balances: context.account?.balances
				},
				undefined,
				2
			)}</Code
		>
	{/if}
</form>
