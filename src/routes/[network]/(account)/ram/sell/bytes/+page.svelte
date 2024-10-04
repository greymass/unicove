<script lang="ts">
	import { getContext } from 'svelte';
	import { Checksum256, Asset } from '@wharfkit/antelope';

	import { getSetting } from '$lib/state/settings.svelte.js';
	import type { UnicoveContext } from '$lib/state/client.svelte';
	import SummarySellRAM from '$lib/components/summary/eosio/sellram.svelte';

	import Button from '$lib/components/button/button.svelte';
	import Code from '$lib/components/code.svelte';
	import Label from '$lib/components/input/label.svelte';
	import Stack from '$lib/components/layout/stack.svelte';
	import Transaction from '$lib/components/transaction.svelte';
	import AssetInput from '$lib/components/input/asset.svelte';

	import { SellRAMState } from '../state.svelte.js';
	import { preventDefault } from '$lib/utils.js';

	const context = getContext<UnicoveContext>('state');
	const { data } = $props();
	const debugMode = getSetting('debug-mode', false);

	const sellRamState: SellRAMState = $state(new SellRAMState(data.network.chain));

	sellRamState.format = 'units';

	let transactionId: Checksum256 | undefined = $state();
	let bytesInput: AssetInput | undefined = $state();

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
		bytesInput?.set(null);
	}

	$effect(() => {
		if (context.account) {
			if (context.account.name) {
				sellRamState.account = context.account.name;
			}
			sellRamState.max = Asset.fromUnits(context.account.ram?.available || 0, '3,KB');
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

<form onsubmit={preventDefault(handleSellRAM)}>
	<Stack class="gap-3">
		<Label for="bytesInput">Amount to sell</Label>
		<AssetInput
			id="bytesInput"
			bind:this={bytesInput}
			bind:value={sellRamState.kbsAmount}
			placeholder="0.000 KB"
			autofocus
		/>
		{#if sellRamState.insufficientRAM}
			<p class="text-red-500">Insufficient RAM available. Please enter a smaller amount.</p>
		{/if}
		<p>
			Available RAM:
			{#if context.account}
				{sellRamState.max}
			{:else}
				0 KB
			{/if}
		</p>
		<p>
			{#if context.account}
				Value of available RAM:

				{sellRamState.maxValue}
			{/if}
		</p>
	</Stack>

	<Stack class="mt-4 gap-3">
		<h3 class="h3">Details</h3>
		<div class="grid grid-cols-2 gap-2">
			<span>RAM Price:</span>
			<span>{sellRamState.pricePerKB} / KB</span>
			<span>RAM to be sold:</span>
			<span>{sellRamState.kbsToSell}</span>
			<span>RAM Value:</span>
			<span>{sellRamState.bytesValue}</span>
			<span>Network Fee (0.5%)</span>
			<span>{sellRamState.fee}</span>
			<span>Expected To Receive:</span>
			<span>~ {sellRamState.expectedToReceive}</span>
		</div>
		{#if sellRamState.valid}
			<SummarySellRAM action={{ data: sellRamState.toJSON() }} />
		{/if}
	</Stack>

	<Button type="submit" class="mt-4 w-full" disabled={!sellRamState.valid}>Confirm Sell RAM</Button>

	{#if debugMode.value}
		<h3 class="h3">Debugging</h3>
		<Code
			>{JSON.stringify(
				{
					account: sellRamState.account,
					bytes: sellRamState.bytes,
					max: sellRamState.max,
					chain: sellRamState.chain,
					pricePerKB: sellRamState.pricePerKB,
					bytesValue: sellRamState.bytesValue,
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
