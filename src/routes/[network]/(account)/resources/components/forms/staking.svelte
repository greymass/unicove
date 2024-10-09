<script lang="ts">
	import AssetInput from '$lib/components/input/asset.svelte';
	import Button from '$lib/components/button/button.svelte';
	import Label from '$lib/components/input/label.svelte';
	import Stack from '$lib/components/layout/stack.svelte';
	import Transaction from '$lib/components/transaction.svelte';

	import { Checksum256, Asset } from '@wharfkit/antelope';
	import type { TransactResult } from '@wharfkit/session';

	import { RentState } from './state.svelte';
	import { RentType, ResourceType } from '../../types';

	import type { UnicoveContext } from '$lib/state/client.svelte';
	import type { NetworkState } from '$lib/state/network.svelte';
	import { getContext } from 'svelte';
	import { preventDefault } from '$lib/utils';

	const context = getContext<UnicoveContext>('state');
	let quantityInput: AssetInput | undefined = $state();

	$effect(() => {
		if (
			context.account &&
			context.network &&
			context.network.sampledUsage &&
			context.network.chain.systemToken
		) {
			if (context.account.name) {
				rentState.payer = context.account.name;
				rentState.receiver = context.account.name;
			}
			rentState.balance = context.account.balance ? context.account.balance.liquid : undefined;

			switch (resourceType) {
				case ResourceType.CPU: {
					rentState.pricePerUnit = Asset.fromUnits(
						context.network.sampledUsage.account.cpu_weight.dividing(
							context.network.sampledUsage.account.cpu_limit.max
						),
						context.network.chain.systemToken.symbol
					);
					break;
				}
				case ResourceType.NET: {
					rentState.pricePerUnit = Asset.fromUnits(
						context.network.sampledUsage.account.net_weight.dividing(
							context.network.sampledUsage.account.net_limit.max
						),
						context.network.chain.systemToken.symbol
					);
					break;
				}
			}
		} else {
			rentState.reset();
		}
	});

	interface Props {
		resourceType: ResourceType;
		network: NetworkState;
	}
	const { resourceType, network }: Props = $props();
	const rentState: RentState = $state(new RentState(network.chain, resourceType, RentType.STAKE));

	let transactionId: Checksum256 | undefined = $state();

	function handleRent() {
		if (!context.wharf || !context.wharf.session || !context.network) {
			alert('Not logged in');
			return;
		}

		try {
			rentState.resetBeforeTransction();
			const actionName = rentState.getActionName();
			const actionData = rentState.getActionData();
			console.log(actionName, actionData);
			const rentAction = context.network.contracts.system.action(actionName!, actionData);
			context.wharf
				.transact({
					action: rentAction
				})
				.then((result: TransactResult) => {
					transactionId = result.response?.transaction_id;
					resetStateAfterTrasaction();
				})
				.catch((error) => {
					rentState.error = String(error);
				});
		} catch (error) {
			console.error(error);
			alert('rex failed: ' + (error as { message: string }).message);
		}
	}
	function resetStateAfterTrasaction() {
		rentState.resetAfterTransction();
		quantityInput?.set(null);
	}

	let assetValid = $state(false);
	let assetValidPrecision = $state(true);
	let assetValidMaximum = $state(true);
	let assetValidMinimum = $state(true);
</script>

{#if transactionId}
	<Transaction {network} {transactionId} />
{/if}

<form onsubmit={preventDefault(handleRent)}>
	<Stack class="gap-3">
		<Label for="assetInput"
			>Amount of {rentState.chain.systemToken!.symbol.code} to stake as {rentState.resourceName}</Label
		>

		<AssetInput
			placeholder="number of tokens"
			bind:this={quantityInput}
			bind:value={rentState.quantity}
			bind:valid={assetValid}
			bind:validPrecision={assetValidPrecision}
			bind:validMinimum={assetValidMinimum}
			bind:validMaximum={assetValidMaximum}
			min={rentState.min}
			max={rentState.max}
		/>
		{#if !assetValidPrecision}
			<p class="text-red-500">Invalid number, too many decimal places.</p>
		{/if}
		<!--Todo: refactor after asset fix-->
		<!-- {#if !assetValidMinimum}
			<p class="text-red-500">Amount is below the minimum value</p>
		{/if} -->
		{#if !assetValidMaximum}
			<p class="text-red-500">Amount exceeds available balance.</p>
		{/if}

		{#if rentState.balance}
			<p>
				Available:{rentState.balance}
			</p>
		{/if}
		{#if rentState.pricePerUnit}
			<p>
				Price:
				{(Number(rentState.pricePerUnit.value) * 1000).toFixed(
					rentState.pricePerUnit.symbol.precision
				)}
			</p>
		{/if}

		{#if rentState.error}
			<p class="text-red-500">
				Error: {rentState.error}
			</p>
		{/if}
		<Button type="submit" class="mt-4 w-full" disabled={!assetValid}>Stake Tokens</Button>
	</Stack>
</form>
