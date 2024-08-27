<script lang="ts">
	import { getContext } from 'svelte';
	import { Asset } from '@wharfkit/antelope';

	import { getSetting } from '$lib/state/settings.svelte.js';
	import type { UnicoveContext } from '$lib/state/client.svelte';

	import Button from '$lib/components/button/button.svelte';
	import Code from '$lib/components/code.svelte';
	import Input from '$lib/components/input/textinput.svelte';
	import Label from '$lib/components/input/label.svelte';
	import Stack from '$lib/components/layout/stack.svelte';

	import { BuyRAMState } from './state.svelte.js';

	const context = getContext<UnicoveContext>('state');
	const { data } = $props();
	const debugMode = getSetting('debug-mode', false);

	const buyRamState: BuyRAMState = $state(new BuyRAMState(data.network.chain));

	async function handleBuyRAM() {
		if (!context.wharf || !context.wharf.session) {
			alert('Not logged in');
			return;
		}

		try {
			await context.wharf.transact({
				action: data.network.contracts.system.action('buyram', buyRamState.toJSON())
			});
			alert('RAM purchase successful');
		} catch (error) {
			console.error(error);
			alert('RAM purchase failed: ' + (error as { message: string }).message);
		}
	}

	function preventDefault(fn: (event: Event) => void) {
		return function (event: Event) {
			event.preventDefault();
			fn.call(this, event);
		};
	}

	function setMax() {
		buyRamState.bytes = buyRamState.max;
	}

	$effect(() => {
		if (context.account) {
			if (context.account.name) {
				buyRamState.payer = context.account.name;
				buyRamState.receiver = context.account.name;
			}
			buyRamState.balance = Asset.from(
				context.account.balance?.liquid?.value || 0,
				data.network.chain.systemToken?.symbol
			);
		}
	});

	$effect(() => {
		if (data.network.ramprice) {
			buyRamState.pricePerKB = data.network.ramprice.eos;
		}
	});
</script>

<form onsubmit={preventDefault(handleBuyRAM)}>
	<Stack class="gap-3">
		<Label for="assetInput">Amount (in bytes)</Label>
		<Input id="assetInput" bind:value={buyRamState.bytes} />
		{#if buyRamState.insufficientBalance}
			<p class="text-red-500">Insufficient balance. Please enter a smaller amount.</p>
		{/if}
		<p>
			Available:
			{#if context.account}
				{context.account.balance?.liquid}
				<Button disabled={!context.account} onclick={preventDefault(setMax)} type="button"
					>Fill Max</Button
				>
			{:else}
				0.0000 {data.network.chain.systemToken}
			{/if}
		</p>
	</Stack>

	<Stack class="mt-4 gap-3">
		<h3 class="h3">Details</h3>
		<div class="grid grid-cols-2 gap-2">
			<span>Price for 1000 bytes:</span>
			<span>{buyRamState.pricePerKB} / KB</span>
			<span>Price for {buyRamState.bytes}:</span>
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
					max: buyRamState.max,
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
