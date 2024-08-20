<script lang="ts">
	import { Asset, Checksum256 } from '@wharfkit/antelope';
	import { getContext, onMount } from 'svelte';
	import type { UnicoveContext } from '$lib/state/client.svelte';
	import AssetInput from '$lib/components/input/asset.svelte';
	import Button from '$lib/components/button/button.svelte';
	import Label from '$lib/components/input/label.svelte';
	import Stack from '$lib/components/layout/stack.svelte';
	import { SellRAMState } from './state.svelte.js';

	const context = getContext<UnicoveContext>('state');
	const { data } = $props();

	const state: SellRAMState = new SellRAMState(data.network.chain);
	let chain: Checksum256 | undefined = $state(data.network.chain.id);
	let assetInput: AssetInput = $state();
	let assetRef = $state();
	let assetValid = $state(false);

	async function handleSellRAM() {
		if (!context.wharf || !context.wharf.session) {
			alert('Not logged in');
			return;
		}

		try {
			await context.wharf.transact({
				action: data.network.contracts.eosio.action('sellram', state.toJSON())
			});
			alert('RAM sale successful');
		} catch (error) {
			alert('RAM sale failed: ' + (error as { message: string }).message);
		}
	}

	function max() {
		// You would need to implement a way to get the current RAM balance
		// This is a placeholder
		assetInput.set(Asset.from('1024 BYTE'));
	}

	onMount(() => {
		state.amount = Asset.from('0 BYTE');
	});

	function preventDefault(fn: (event: Event) => void) {
		return function (event: Event) {
			event.preventDefault();
			fn.call(this, event);
		};
	}
</script>

<form on:submit={preventDefault(handleSellRAM)}>
	<Stack class="gap-3">
		<Label for="assetInput">Amount (in bytes)</Label>
		<AssetInput
			id="assetInput"
			bind:this={assetInput}
			bind:ref={assetRef}
			bind:value={state.amount}
			bind:valid={assetValid}
			max={state.max}
		/>
		<p>
			Available:
			{#if context.account}
				1024 Bytes
				<Button disabled={!context.account} on:click={preventDefault(max)} type="button"
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
			<span>Price Impact:</span>
			<span>~0.01%</span>
			<span>Fee:</span>
			<span>0.0001 EOS</span>
			<span>Expected Return:</span>
			<span>{state.amount.value / 512} EOS</span>
		</div>
	</Stack>

	<Button type="submit" class="mt-4 w-full" disabled={!assetValid}>Confirm Sell RAM</Button>
</form>
