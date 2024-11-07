<script lang="ts">
	import { Card, Stack } from '$lib/components/layout';
	import AssetInput from '$lib/components/input/asset.svelte';
	import AssetText from '$lib/components/elements/asset.svelte';
	import TokenCard from '$lib/components/elements/tokencard.svelte';
	import Button from '$lib/components/button/button.svelte';
	import Label from '$lib/components/input/label.svelte';
	import Transaction from '$lib/components/transaction.svelte';
	import type { UnicoveContext } from '$lib/state/client.svelte';
	import { getContext } from 'svelte';
	import { UnstakeManager } from './manager.svelte';

	const context = getContext<UnicoveContext>('state');
	const { data } = $props();

	let manager: UnstakeManager = $state(new UnstakeManager(data.network));

	let hints = $derived([
		{ caption: 'In 21 days you can claim', data: manager.assetValue.toString() },
		{ caption: 'Lockup', data: '21 Days' }
	]);

	$effect(() => {
		if (context.account) {
			manager.sync(data.network, context.account, context.wharf);
		}
	});
</script>

{#if manager.txid}
	<Transaction network={data.network} transactionId={manager.txid} />
{:else if manager.error}
	<div>
		<h2 class="h2">Transaction Error</h2>
		<p>There was an error submitting your transaction.</p>
	</div>
{:else}
	<Card>
		<Stack class="mx-auto w-96 space-y-8">
			<TokenCard token={manager.tokenBalance} title="Staked" description="Currently staked" />
			<Stack class="gap-3">
				<Label for="assetInput">Amount</Label>
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
						type="button">Available: <AssetText value={manager.unstakable} /></button
					>
				</Label>
				<Button
					disabled={!manager.assetValid}
					onclick={() => manager.transact()}
					variant="secondary"
					class="text-skyBlue-500">Unstake</Button
				>
			</Stack>
			<table class="table-styles">
				<tbody>
					{#each hints as hint}
						<tr>
							<td class="caption">
								{hint.caption}
							</td>
							<td>
								{hint.data}
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</Stack>
	</Card>
{/if}
