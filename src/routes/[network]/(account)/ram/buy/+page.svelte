<script lang="ts">
	import { getContext } from 'svelte';
	import { Checksum256 } from '@wharfkit/antelope';

	import { getSetting } from '$lib/state/settings.svelte.js';
	import type { UnicoveContext } from '$lib/state/client.svelte';

	import SummaryBuyRAMBytes from '$lib/components/summary/eosio/buyrambytes.svelte';
	import SummaryBuyRAM from '$lib/components/summary/eosio/buyram.svelte';

	import Button from '$lib/components/button/button.svelte';
	import Code from '$lib/components/code.svelte';
	import Label from '$lib/components/input/label.svelte';
	import Stack from '$lib/components/layout/stack.svelte';
	import Transaction from '$lib/components/transaction.svelte';
	import AssetInput from '$lib/components/input/asset.svelte';
	import BytesInput from '$lib/components/input/bytes.svelte';
	import Card from '$lib/components/layout/box/card.svelte';
	import AssetText from '$lib/components/elements/asset.svelte';
	import RamResource from '$lib/components/elements/ramresource.svelte';

	import { BuyRAMState } from './state.svelte';
	import { calAvailableSize, preventDefault } from '$lib/utils';

	let bytesInput: BytesInput | undefined = $state();
	let assetInput: AssetInput | undefined = $state();

	const context = getContext<UnicoveContext>('state');
	const { data } = $props();
	const debugMode = getSetting('debug-mode', true);

	const buyRamState: BuyRAMState = $state(new BuyRAMState(data.network.chain));
	const ramAvailableSize = $derived(calAvailableSize(context.account?.ram));

	let transactionId: Checksum256 | undefined = $state();

	async function handleBuyRAM() {
		if (!context.wharf || !context.wharf.session) {
			alert('Not logged in');
			return;
		}

		try {
			const transactionResult = await context.wharf.transact({
				action: data.network.contracts.system.action(
					buyRamState.format === 'asset' ? 'buyram' : 'buyrambytes',
					buyRamState.toJSON()
				)
			});

			transactionId = transactionResult.resolved?.transaction.id;

			resetState();
		} catch (error) {
			console.error(error);
		}
	}

	function resetState() {
		buyRamState.reset();
		bytesInput?.reset();
		assetInput?.reset();
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

	function setAssetAmount() {
		buyRamState.format = 'asset';
		buyRamState.bytes = buyRamState.expectedBytes;
	}

	function setBytesAmount() {
		buyRamState.format = 'bytes';
		buyRamState.tokens = buyRamState.bytesValue;
		assetInput?.set(buyRamState.bytesValue);
	}
</script>

{#if transactionId}
	<Transaction network={data.network} {transactionId} />
{/if}

<Card>
	<form onsubmit={preventDefault(handleBuyRAM)} class="mx-auto max-w-2xl space-y-4">
		<RamResource class="hidden" ramAvailable={ramAvailableSize} />

		<Stack class="gap-3">
			<Label class="text-lg" for="bytesInput">Amount to buy</Label>
			<div class="flex gap-4">
				<div class="flex-1">
					<AssetInput
						bind:value={buyRamState.tokens}
						bind:this={assetInput}
						oninput={setAssetAmount}
						autofocus
					/>
				</div>
				<div class="flex-1">
					<BytesInput
						bind:value={buyRamState.bytes}
						bind:this={bytesInput}
						oninput={setBytesAmount}
					/>
				</div>
			</div>
			{#if buyRamState.insufficientBalance}
				<p class="text-red-500">Insufficient balance. Please enter a smaller amount.</p>
			{/if}
			<p>
				Balance available:
				{#if context.account}
					{context.account.balance?.liquid}
				{:else}
					0.0000 {data.network.chain.systemToken?.symbol.code || ''}
				{/if}
			</p>
		</Stack>

		<Button type="submit" class="mt-4 w-full" disabled={!buyRamState.valid}>Confirm Buy RAM</Button>

		<Stack class="mt-4 gap-3">
			<div class="grid grid-cols-2 gap-y-0 text-lg">
				<p class="text-gray-400">RAM Price</p>
				<AssetText variant="full" class="text-right" value={buyRamState.pricePerKB} />

				<div class="border-gray-600 col-span-2 my-2 border-b"></div>

				<p class="text-gray-400">RAM to be bought</p>
				<AssetText variant="full" class="text-right" value={buyRamState.kbs} />

				<div class="border-gray-600 col-span-2 my-2 border-b"></div>

				<p class="text-gray-400">RAM Value</p>
				<AssetText variant="full" class="text-right" value={buyRamState.bytesValue} />

				<div class="border-gray-600 col-span-2 my-2 border-b"></div>

				<p class="text-gray-400">Network Fee (0.5%)</p>
				<AssetText variant="full" class="text-right" value={buyRamState.fee} />

				<div class="border-gray-600 col-span-2 my-2 border-b"></div>

				<p class="text-gray-400">Total Cost</p>
				<AssetText variant="full" class="text-right" value={buyRamState.bytesCost} />
			</div>

			{#if buyRamState.valid}
				{#if buyRamState.format === 'asset'}
					<SummaryBuyRAM action={{ data: buyRamState.toJSON() }} />
				{:else}
					<SummaryBuyRAMBytes action={{ data: buyRamState.toJSON() }} />
				{/if}
			{/if}
		</Stack>

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
</Card>
