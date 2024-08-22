<script lang="ts">
	import { Asset } from '@wharfkit/antelope';
	import { getContext, onMount } from 'svelte';
	import type { UnicoveContext } from '$lib/state/client.svelte';
	import Input from '$lib/components/input/textinput.svelte';
	import Button from '$lib/components/button/button.svelte';
	import Label from '$lib/components/input/label.svelte';
	import Stack from '$lib/components/layout/stack.svelte';
	import { BuyRAMState } from './state.svelte.js';

	const context = getContext<UnicoveContext>('state');
	const { data } = $props();

	const buyRamState: BuyRAMState = $state(new BuyRAMState(data.network.chain));
	let quantityInput: Input | undefined = $state();
	let quantityValid = $state(false);

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
			alert('RAM purchase failed: ' + (error as { message: string }).message);
		}
	}

	function setMax() {
		console.log('setMax', { context, ram: Number(context.account?.ram?.available) });
		if (data.network.chain.systemToken && context.account?.ram) {
			buyRamState.quant = Number(context.account.ram.available);
		}
	}

	onMount(() => {
		if (data.network && data.network.chain.systemToken) {
			buyRamState.quant = 0;
		}
	});

	function preventDefault(fn: (event: Event) => void) {
		return function (event: Event) {
			event.preventDefault();
			fn.call(this, event);
		};
	}

	function onAssetChange(event: CustomEvent) {
		buyRamState.quant = event.detail.value;
		quantityValid = event.detail.valid;
	}
</script>

<form on:submit={preventDefault(handleBuyRAM)}>
	<Stack class="gap-3">
		<Label for="assetInput">Amount</Label>
		<Input
			id="assetInput"
			bind:value={buyRamState.quant}
			on:change={onAssetChange}
			max={buyRamState.max}
		/>
		<p>
			Available:
			{#if context.account}
				{context.account.balance?.liquid}
				<Button disabled={!context.account} onclick={preventDefault(setMax)} type="button"
					>Fill Max</Button
				>
			{:else}
				0.0000
			{/if}
		</p>
	</Stack>

	<Stack class="mt-4 gap-3">
		<h3 class="h3">Details</h3>
		<div class="grid grid-cols-2 gap-2">
			<span>Price:</span>
			<span>1 EOS = 512 Bytes</span>
			<span>Expected Receive:</span>
			<span>{buyRamState.quant * 512} Bytes</span>
		</div>
	</Stack>

	<Button type="submit" class="mt-4 w-full" disabled={!quantityValid}>Confirm Buy RAM</Button>
</form>
