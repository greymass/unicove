<script lang="ts">
	import { Asset } from '@wharfkit/antelope';
	import { getContext, onMount } from 'svelte';
	import type { UnicoveContext } from '$lib/state/client.svelte';
	import AssetInput from '$lib/components/input/asset.svelte';
	import Button from '$lib/components/button/button.svelte';
	import Label from '$lib/components/input/label.svelte';
	import Stack from '$lib/components/layout/stack.svelte';

	const context = getContext<UnicoveContext>('state');
	const { data } = $props();

	class BuyRAMState {
		public amount: Asset = $state(Asset.from('0.0000 EOS'));
		public max: number | undefined = $state(undefined);

		reset() {
			this.amount = Asset.from('0.0000 EOS');
			this.max = undefined;
		}
	}

	const state: BuyRAMState = $state(new BuyRAMState());
	let assetInput: AssetInput = $state();
	let assetRef = $state();
	let assetValid = $state(false);

	async function handleBuyRAM() {
		if (!context.wharf || !context.wharf.session) {
			alert('Not logged in');
			return;
		}

		try {
			await context.wharf.transact({
				action: data.network.contracts.eosio.action('buyram', {
					payer: context.account.name,
					receiver: context.account.name,
					quant: state.amount
				})
			});
			alert('RAM purchase successful');
		} catch (error) {
			alert('RAM purchase failed: ' + error.message);
		}
	}

	function max() {
		if (data.network.systemtoken && context.account && context.account.balance) {
			assetInput.set(context.account.balance.liquid);
		}
	}

	onMount(() => {
		if (data.network && data.network.systemtoken) {
			state.amount = Asset.from('0.0000 ' + data.network.systemtoken.symbol);
		}
	});

	function preventDefault(fn: (event: Event) => void) {
		return function (event: Event) {
			event.preventDefault();
			fn.call(this, event);
		};
	}
</script>

<form on:submit={preventDefault(handleBuyRAM)}>
	<Stack class="gap-3">
		<Label for="assetInput">Amount</Label>
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
			<span>{state.amount.value * 512} Bytes</span>
		</div>
	</Stack>

	<Button type="submit" class="mt-4 w-full" disabled={!assetValid}>Confirm Buy RAM</Button>
</form>
