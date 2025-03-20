<script lang="ts">
	import { Stack } from '$lib/components/layout';
	import AssetInput from '$lib/components/input/asset.svelte';
	import AssetText from '$lib/components/elements/asset.svelte';
	import TokenCard from '$lib/components/elements/tokencard.svelte';
	import Button from '$lib/components/button/button.svelte';
	import Label from '$lib/components/input/label.svelte';
	import TransactSummary from '$lib/components/transact/summary.svelte';
	import TransactError from '$lib/components/transact/error.svelte';
	import type { UnicoveContext } from '$lib/state/client.svelte';
	import { getContext } from 'svelte';
	import { StakeManager } from './manager.svelte';
	import { DL } from '$lib/components/descriptionlist';
	import * as m from '$lib/paraglide/messages';

	const context = getContext<UnicoveContext>('state');
	const { data } = $props();

	let manager: StakeManager = $state(new StakeManager(data.network));
	let ready = $derived(manager.assetValid && !context.wharf.transacting);

	let hints = $derived([
		{
			title: m.common_amount_to_act({ action: m.common_stake() }),
			description: manager.assetValue.toString()
		},
		{ title: m.staking_minimum_lockup(), description: '21 days' },
		{ title: m.common_apr_current(), description: manager.apr + '%' },
		{ title: m.staking_estimated_yield_yearly(), description: String(manager.estimateYield) }
	]);

	$effect(() => {
		if (context.account) {
			manager.sync(data.network, context.account, context.wharf);
		}
	});

	function resetState() {
		manager = new StakeManager(data.network);
	}
</script>

<Stack>
	{#if manager.txid}
		<TransactSummary transactionId={manager.txid} />
		<Button href={`/${data.network}/staking`} variant="secondary">
			{m.search_result_description_staking()}
		</Button>
		<Button href={`/${data.network}/account/${context.account?.name}`}>
			{m.common_view_my_account()}
		</Button>
	{:else if manager.error}
		<TransactError error={manager.error} />
		<Button onclick={resetState}>{m.common_close()}</Button>
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
					class="text-sky-blue-500 hover:text-sky-blue-400"
					onclick={() => {
						manager.setMaxValue();
					}}
					type="button"
					>{m.common_labeled_unit_available({ unit: '' })}:
					<AssetText value={manager.stakable} />
				</button>
			</Label>
			<Button disabled={!ready} onclick={() => manager.transact()} variant="primary"
				>{m.common_stake()}</Button
			>
		</Stack>

		<DL items={hints} />
	{/if}
</Stack>
