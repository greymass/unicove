<script lang="ts">
	import AssetInput from '$lib/components/input/asset.svelte';
	import Button from '$lib/components/button/button.svelte';
	import Label from '$lib/components/input/label.svelte';
	import Stack from '$lib/components/layout/stack.svelte';

	import { RentState } from './state.svelte';

	import { RentType, ResourceType } from '../../types.svelte';

	import { preventDefault } from '$lib/utils';

	import type { UnicoveContext } from '$lib/state/client.svelte';
	import { getContext } from 'svelte';

	const context = getContext<UnicoveContext>('state');

	$effect(() => {
		if (context.account && context.network) {
			if (context.account.name) {
				rentState.payer = context.account.name;
				rentState.receiver = context.account.name;
			}
			if (context.network.chain.systemToken) {
				rentState.coreSymbol = context.network.chain.systemToken.symbol;
			}
			rentState.balance = context.account.balance ? context.account.balance.liquid : undefined;
			rentState.pricePerUnit = context.network.stakingprice;
		} else {
			rentState.reset();
		}
	});

	interface Props {
		resourceType: ResourceType;
	}
	const { resourceType }: Props = $props();
	const rentState: RentState = $state(new RentState(resourceType, RentType.STAKE));

	function handleRent() {
		if (!context.wharf || !context.wharf.session || !context.network) {
			alert('Not logged in');
			return;
		}

		try {
			const actionName = rentState.getActionName();
			const actionData = rentState.getActionData();
			const rentAction = context.network.contracts.system.action(actionName!, actionData);

			context.wharf
				.transact({
					action: rentAction
				})
				.then((result: any) => {
					rentState.txid = String(result.response.transaction_id);
				})
				.catch((error) => {
					rentState.error = String(error);
				});
		} catch (error) {
			console.error(error);
			alert('rex failed: ' + (error as { message: string }).message);
		}
	}
	function handleSuccessBack() {
		rentState.reset();
	}

	let assetValid = $state(false);
	let assetValidPrecision = $state(true);
	let assetValidMaximum = $state(true);
	let assetValidMinimum = $state(true);
</script>

{#if rentState.txid}
	<Stack>
		<h2>Success</h2>
		<p>{rentState.txid}</p>
		<Button onclick={handleSuccessBack} variant="pill" class="text-blue-400">Back</Button>
	</Stack>
{:else}
	<form on:submit={preventDefault(handleRent)}>
		<Stack class="gap-3">
			<Label>Amount of {rentState.coreSymbol?.code} to stake as {rentState.resourceName}</Label>

			<AssetInput
				placeholder="number of tokens"
				bind:value={rentState.amountValue}
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
			{#if !assetValidMinimum}
				<p class="text-red-500">Amount is below the minimum value</p>
			{/if}
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
		</Stack>
		{#if rentState.error}
			<p class="text-red-500">
				Error: {rentState.error}
			</p>
		{/if}
		<Button type="submit" class="mt-4 w-full" disabled={!assetValid}>Stake Tokens</Button>
	</form>
{/if}
