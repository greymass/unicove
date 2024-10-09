<script lang="ts">
	import { getContext } from 'svelte';
	import { Checksum256 } from '@wharfkit/antelope';

	import { getSetting } from '$lib/state/settings.svelte.js';
	import type { UnicoveContext } from '$lib/state/client.svelte';

	import SummarySellRAM from '$lib/components/summary/eosio/sellram.svelte';

	import Button from '$lib/components/button/button.svelte';
	import Code from '$lib/components/code.svelte';
	import Label from '$lib/components/input/label.svelte';
	import Stack from '$lib/components/layout/stack.svelte';
	import Transaction from '$lib/components/transaction.svelte';
	import AssetInput from '$lib/components/input/asset.svelte';
	import BytesInput from '$lib/components/input/bytes.svelte';
	import Card from '$lib/components/layout/box/card.svelte';

	import { SellRAMState } from './state.svelte.js';
	import { preventDefault } from '$lib/utils.js';

	let bytesInput: BytesInput | undefined = $state();
	let assetInput: AssetInput | undefined = $state();

	const context = getContext<UnicoveContext>('state');
	const { data } = $props();
	const debugMode = getSetting('debug-mode', true);

	const sellRamState: SellRAMState = $state(new SellRAMState(data.network.chain));

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
		bytesInput?.reset();
		assetInput?.reset();
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

	function setAssetAmount() {
		sellRamState.format = 'asset';
		sellRamState.bytes = sellRamState.bytesToSell;
	}

	function setBytesAmount() {
		sellRamState.format = 'bytes';
		sellRamState.tokens = sellRamState.bytesValue;
		assetInput?.set(sellRamState.bytesValue);
	}
</script>

{#if transactionId}
	<Transaction network={data.network} {transactionId} />
{/if}

<form onsubmit={preventDefault(handleSellRAM)}>
	<Stack class="gap-3">
		<Label for="bytesInput">Amount to sell</Label>
		<div class="flex gap-4">
			<div class="flex-1">
				<AssetInput
					bind:value={sellRamState.tokens}
					bind:this={assetInput}
					oninput={setAssetAmount}
					autofocus
				/>
			</div>
			<div class="flex-1">
				<BytesInput
					bind:value={sellRamState.bytes}
					bind:this={bytesInput}
					oninput={setBytesAmount}
				/>
			</div>
		</div>
		{#if sellRamState.insufficientRAM}
			<p class="text-red-500">Insufficient RAM available. Please enter a smaller amount.</p>
		{/if}
		<p>
			RAM available:
			{#if context.account}
				{sellRamState.maxInKBs}
			{:else}
				0 KB
			{/if}
		</p>
	</Stack>

	<Stack class="mt-4 gap-3">
		<Card>
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
		</Card>

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
