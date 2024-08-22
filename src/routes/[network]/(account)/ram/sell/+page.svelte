<script lang="ts">
	import { Asset } from '@wharfkit/antelope';
	import { getContext } from 'svelte';
	import type { UnicoveContext } from '$lib/state/client.svelte';
	import Input from '$lib/components/input/textinput.svelte';
	import Button from '$lib/components/button/button.svelte';
	import Label from '$lib/components/input/label.svelte';
	import Stack from '$lib/components/layout/stack.svelte';
	import { SellRAMState } from './state.svelte.js';

	const context = getContext<UnicoveContext>('state');
	const { data } = $props();

	const sellRamState: SellRAMState = $state(new SellRAMState(data.network.chain));
	let quantityInput: Input | undefined = $state();
	let quantityValid = $state(false);

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
		quantityInput?.set(Asset.from('1024 BYTE'));
		quantityValid = true;
	}

	function onQuantityChange(event: CustomEvent) {
		sellRamState.bytes = event.detail.value;
		quantityValid = event.detail.valid;
	}
</script>

<form on:submit={preventDefault(handleSellRAM)}>
	<Stack class="gap-3">
		<Label for="assetInput">Amount (in bytes)</Label>
		<Input
			id="assetInput"
			bind:value={sellRamState.bytes}
			on:change={onQuantityChange}
			max={sellRamState.max}
		/>
		<p>
			Available:
			{#if context.account}
				{context.account.ram?.available} Bytes
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
			<span>512 Bytes = 1 EOS</span>
			<span>Expected Receive:</span>
			<span>{sellRamState.bytes / 512} EOS</span>
		</div>
	</Stack>

	<Button type="submit" class="mt-4 w-full" disabled={!quantityValid}>Confirm Sell RAM</Button>
</form>
