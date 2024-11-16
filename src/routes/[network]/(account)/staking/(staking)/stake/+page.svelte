<script lang="ts">
	import { Stack } from '$lib/components/layout';
	import AssetInput from '$lib/components/input/asset.svelte';
	import AssetText from '$lib/components/elements/asset.svelte';
	import TokenCard from '$lib/components/elements/tokencard.svelte';
	import Button from '$lib/components/button/button.svelte';
	import Label from '$lib/components/input/label.svelte';
	import Transaction from '$lib/components/transaction.svelte';
	import type { UnicoveContext } from '$lib/state/client.svelte';
	import { getContext } from 'svelte';
	import { StakeManager } from './manager.svelte';
	import Descriptionlist from '$lib/components/descriptionlist.svelte';

	const context = getContext<UnicoveContext>('state');
	const { data } = $props();

	let manager: StakeManager = $state(new StakeManager(data.network));

	let hints = $derived([
		{ key: 'Amount to stake', value: manager.assetValue.toString() },
		{ key: 'Minimum lockup', value: '21 days' },
		{ key: 'Estimated APR', value: manager.apr + '%' },
		{ key: 'Estimated Yield (Yearly)', value: String(manager.estimateYield) }
	]);

	$effect(() => {
		if (context.account) {
			manager.sync(data.network, context.account, context.wharf);
		}
	});
</script>

<Stack>
	{#if manager.txid}
		<Transaction network={data.network} transactionId={manager.txid} />
	{:else if manager.error}
		<h2 class="h2">Transaction Error</h2>
		<p>There was an error submitting your transaction.</p>
	{:else}
		<TokenCard token={manager.tokenBalance} title="Staked" description="Currently staked" />
		<Stack class="gap-3">
			<Label for="assetInput">Amount to stake</Label>
			<AssetInput
				autofocus
				bind:this={manager.input}
				bind:min={manager.minValue}
				bind:max={manager.maxValue}
				bind:value={manager.assetValue}
				bind:valid={manager.assetValid}
				bind:validPrecision={manager.assetValidPrecision}
				bind:validMinimum={manager.assetValidMinimum}
				bind:validMaximum={manager.assetValidMaximum}
			/>
			{#if !manager.assetValid}
				{#if !manager.assetValidPrecision}
					<p class="text-red-500">Invalid number, too many decimal places.</p>
				{/if}
				{#if !manager.assetValidMaximum}
					<p class="text-red-500">Amount exceeds available balance.</p>
				{/if}
			{/if}

			<Label for="quantity-input">
				<button
					class="text-skyBlue-500 hover:text-skyBlue-400"
					onclick={() => {
						manager.setMaxValue();
					}}
					type="button">Available: <AssetText value={manager.stakable} /></button
				>
			</Label>
			<Button disabled={!manager.assetValid} onclick={() => manager.transact()} variant="primary"
				>Stake</Button
			>
		</Stack>

		<Descriptionlist items={hints} />
	{/if}
</Stack>
