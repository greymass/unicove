<script lang="ts">
	import { Asset } from '@wharfkit/antelope';
	import { getContext, onMount } from 'svelte';
	import type { UnicoveContext } from '$lib/state/client.svelte';
	import AssetInput from '$lib/components/input/asset.svelte';
	import Button from '$lib/components/button/button.svelte';
	import Label from '$lib/components/input/label.svelte';
	import Stack from '$lib/components/layout/stack.svelte';
	import { BuyRAMState } from './state.svelte.js';

	const context = getContext<UnicoveContext>('state');
	const { data } = $props();

	const buyRamState: BuyRAMState = new BuyRAMState(data.network.chain);
	let assetInput: AssetInput | undefined;
	let assetValid = false;

	async function handleBuyRAM() {
		if (!context.wharf || !context.wharf.session) {
			alert('Not logged in');
			return;
		}

		try {
			await context.wharf.transact({
				action: data.network.contracts.eosio.action('buyram', buyRamState.toJSON())
			});
			alert('RAM purchase successful');
		} catch (error) {
			alert('RAM purchase failed: ' + (error as { message: string }).message);
		}
	}

	function max() {
		if (data.network.systemtoken && context.account && context.account.balance) {
			assetInput?.set(context.account.balance.liquid);
		}
	}

	onMount(() => {
		if (data.network && data.network.systemtoken) {
			buyRamState.quant = Asset.from('0.0000 ' + data.network.systemtoken.symbol);
		}
	});

	function preventDefault(fn: (event: Event) => void) {
		return function (event: Event) {
			event.preventDefault();
			// fn.call(this, event);
		};
	}

	function onAssetChange(event: CustomEvent) {
		buyRamState.quant = event.detail.value;
		assetValid = event.detail.valid;
	}
</script>

<form on:submit={preventDefault(handleBuyRAM)}>
	<Stack class="gap-3">
		<Label for="assetInput">Amount</Label>
		<AssetInput
			id="assetInput"
			bind:value={buyRamState.quant}
			on:change={onAssetChange}
			max={buyRamState.max}
		/>
		<p>
			Available:
			{#if context.account}
				{context.account.balance?.liquid}
				<Button disabled={!context.account} on:click={preventDefault(max)} type="button"
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
			<span>Price Impact:</span>
			<span>~0.01%</span>
			<span>Fee:</span>
			<span>0.0001 EOS</span>
			<span>Expected Receive:</span>
			<span>{buyRamState.quant.value * 512} Bytes</span>
		</div>
	</Stack>

	<Button type="submit" class="mt-4 w-full" disabled={!assetValid}>Confirm Buy RAM</Button>
</form>
