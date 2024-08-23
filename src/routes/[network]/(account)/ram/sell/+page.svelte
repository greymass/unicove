<script lang="ts">
	import { onMount, getContext } from 'svelte';
	import { Asset, Int64 } from '@wharfkit/antelope';
	import type { UnicoveContext } from '$lib/state/client.svelte';
	import Input from '$lib/components/input/textinput.svelte';
	import Button from '$lib/components/button/button.svelte';
	import Label from '$lib/components/input/label.svelte';
	import Stack from '$lib/components/layout/stack.svelte';
	import { SellRAMState } from './state.svelte.js';

	const context = getContext<UnicoveContext>('state');
	const { data } = $props();

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

	let getRamPriceInterval: NodeJS.Timeout;

	onMount(() => {
		getRamPriceInterval = setInterval(getRamPrice, 3000);

		return () => clearInterval(getRamPriceInterval);
	});

	$effect(() => {
		if (context.network) {
			getRamPrice();
		}
	});

	async function getRamPrice() {
		console.log('Getting RAM price');
		const table = context.network?.contracts.system.table('rammarket');

		const ramMarket = await table?.get();

		console.log({ ramMarket });

		if (!ramMarket) {
			return;
		}

		const pricePerKB = (ramMarket.quote.balance.value * 1024) / ramMarket.base.balance.value;

		console.log({ pricePerKB });

		sellRamState.pricePerKB = Asset.from(pricePerKB, data.network.chain.systemToken);
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
</script>

<form on:submit={preventDefault(handleSellRAM)}>
	<Stack class="gap-3">
		<Label for="assetInput">Amount (in bytes)</Label>
		<Input id="assetInput" bind:value={sellRamState.bytes} />
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
</form>
