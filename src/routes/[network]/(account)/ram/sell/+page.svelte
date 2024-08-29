<script lang="ts">
	import { getContext } from 'svelte';

	import type { UnicoveContext } from '$lib/state/client.svelte';
	import { SellRAMState } from './state.svelte.js';
	import { getSetting } from '$lib/state/settings.svelte.js';

	import Input from '$lib/components/input/textinput.svelte';
	import Button from '$lib/components/button/button.svelte';
	import Label from '$lib/components/input/label.svelte';
	import Stack from '$lib/components/layout/stack.svelte';
	import Code from '$lib/components/code.svelte';

	const context = getContext<UnicoveContext>('state');
	const { data } = $props();
	const debugMode = getSetting('debug-mode', false);

	const sellRamState: SellRAMState = $state(new SellRAMState(data.network.chain));

	async function handleSellRAM() {
		if (!context.wharf || !context.wharf.session) {
			alert('Not logged in');
			return;
		}

		try {
			await context.wharf.transact({
				action: data.network.contracts.system.action('sellram', sellRamState.toJSON())
			});
			alert('RAM sale successful');
		} catch (error) {
			console.error(error);
			alert('RAM sale failed: ' + (error as { message: string }).message);
		}
	}

	function preventDefault(fn: (event: Event) => void) {
		return function (event: Event) {
			event.preventDefault();
			fn.call(this, event);
		};
	}

	function setMax() {
		sellRamState.bytes = sellRamState.max;
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

<form onsubmit={preventDefault(handleSellRAM)}>
	<Stack class="gap-3">
		<Label for="assetInput">Amount (in bytes)</Label>
		<Input id="assetInput" bind:value={sellRamState.bytes} autofocus />
		{#if sellRamState.insufficientRAM}
			<p class="text-red-500">Insufficient RAM available. Please enter a smaller amount.</p>
		{/if}
		<p>
			Available:
			{#if context.account}
				{sellRamState.max} Bytes
				<Button disabled={!context.account} onclick={preventDefault(setMax)} type="button"
					>Fill Max</Button
				>
			{:else}
				0 Bytes
			{/if}
		</p>
	</Stack>

	<Stack class="mt-4 gap-3">
		<h3 class="h3">Details</h3>
		<div class="grid grid-cols-2 gap-2">
			<span>Price:</span>
			<span>{sellRamState.pricePerKB} / KB</span>
			<span>Expected To Receive:</span>
			<span>{sellRamState.bytesValue}</span>
		</div>
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
					pricePerByte: sellRamState.pricePerByte,
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
