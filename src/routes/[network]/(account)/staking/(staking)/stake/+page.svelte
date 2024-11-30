<script lang="ts">
	import { Stack } from '$lib/components/layout';
	import AssetInput from '$lib/components/input/asset.svelte';
	import AssetText from '$lib/components/elements/asset.svelte';
	import TokenCard from '$lib/components/elements/tokencard.svelte';
	import Button from '$lib/components/button/button.svelte';
	import Label from '$lib/components/input/label.svelte';
	import TransactionSummary from '$lib/components/transactionSummary.svelte';
	import type { UnicoveContext } from '$lib/state/client.svelte';
	import { getContext } from 'svelte';
	import { StakeManager } from './manager.svelte';
	import Descriptionlist from '$lib/components/descriptionlist.svelte';
	import * as m from '$lib/paraglide/messages';

	const context = getContext<UnicoveContext>('state');
	const { data } = $props();

	let manager: StakeManager = $state(new StakeManager(data.network));

	let hints = $derived([
		{
			key: m.common_amount_to_act({
				action: m.common_stake()
			}),
			value: manager.assetValue.toString()
		},
		{ key: m.staking_minimum_lockup(), value: '21 days' },
		{ key: m.common_apr_current(), value: manager.apr + '%' },
		{ key: m.staking_estimated_yield_yearly(), value: String(manager.estimateYield) }
	]);

	$effect(() => {
		if (context.account) {
			manager.sync(data.network, context.account, context.wharf);
		}
	});
</script>

<Stack>
	{#if manager.txid}
		<TransactionSummary transactionId={manager.txid} />
	{:else if manager.error}
		<h2 class="h2">{m.common_transaction_error()}</h2>
		<p>{m.common_transaction_error_subtitle()}</p>
	{:else}
		<TokenCard
			token={manager.tokenBalance}
			title={m.common_staked()}
			description={m.common_staked_currently()}
		/>
		<Stack class="gap-3">
			<Label for="assetInput"
				>{m.common_amount_to_act({
					action: m.common_stake()
				})}</Label
			>
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
					<p class="text-red-500">{m.form_validation_invalid_number_decimals()}</p>
				{/if}
				{#if !manager.assetValidMaximum}
					<p class="text-red-500">{m.common_amount_exceeds_balance()}</p>
				{/if}
			{/if}

			<Label for="quantity-input">
				<button
					class="text-skyBlue-500 hover:text-skyBlue-400"
					onclick={() => {
						manager.setMaxValue();
					}}
					type="button"
					>{m.common_labeled_unit_available({ unit: '' })}:
					<AssetText value={manager.stakable} />
				</button>
			</Label>
			<Button disabled={!manager.assetValid} onclick={() => manager.transact()} variant="primary"
				>{m.common_stake()}</Button
			>
		</Stack>

		<Descriptionlist items={hints} />
	{/if}
</Stack>
