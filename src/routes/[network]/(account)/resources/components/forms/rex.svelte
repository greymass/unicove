<script lang="ts">
	import NumberInput from '$lib/components/input/number.svelte';
	import Button from '$lib/components/button/button.svelte';
	import Label from '$lib/components/input/label.svelte';
	import Stack from '$lib/components/layout/stack.svelte';
	import Transaction from '$lib/components/transaction.svelte';
	import RentRecipient from '$lib/components/elements/rentRecipient.svelte';
	import { preventDefault } from '$lib/utils';

	import { Checksum256 } from '@wharfkit/antelope';

	import { RentState } from './state.svelte';
	import { RentType, ResourceType } from '../../types';

	import type { UnicoveContext } from '$lib/state/client.svelte';
	import type { NetworkState } from '$lib/state/network.svelte';
	import { getContext } from 'svelte';

	const context = getContext<UnicoveContext>('state');

	$effect(() => {
		if (context.account && context.network) {
			if (context.account.name) {
				rentState.payer = context.account.name;
				rentState.receiver = context.account.name;
				rentRecipient?.set(String(context.account.name));
			}
			rentState.balance = context.account.balance ? context.account.balance.liquid : undefined;
			rentState.pricePerUnit = context.network.rexprice;
		} else {
			rentState.reset();
		}
	});

	interface Props {
		resourceType: ResourceType;
		network: NetworkState;
	}
	const { resourceType, network }: Props = $props();
	const rentState: RentState = $state(new RentState(network.chain, resourceType, RentType.REX));

	let resourceNumberInput: NumberInput | undefined = $state();
	let rentRecipient: RentRecipient | undefined = $state();
	let recipienteValid = $state(true);

	let transactionId: Checksum256 | undefined = $state();

	function handleRent() {
		if (!context.wharf || !context.wharf.session || !context.network) {
			alert('Not logged in');
			return;
		}

		try {
			rentState.resetBeforeTransction();
			const depositData = rentState.getDepositData();
			const depositAction = context.network.contracts.system.action('deposit', depositData);
			const rentData = rentState.getActionData();
			const rentAction = context.network.contracts.system.action(
				rentState.getActionName(),
				rentData
			);
			context.wharf
				.transact({
					actions: [depositAction, rentAction]
				})
				.then((result: any) => {
					transactionId = result.response.transaction_id;
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
		resourceNumberInput?.set();
	}
</script>

{#if transactionId}
	<Transaction {network} {transactionId} />
{/if}

<form onsubmit={preventDefault(handleRent)}>
	<Stack class="gap-3">
		<RentRecipient
			bind:this={rentRecipient}
			bind:value={rentState.receiver}
			bind:valid={recipienteValid}
		/>
		<fieldset class="grid gap-2">
			<Label for="resourceNumberInput">Amount of {rentState.resourceUnit} to rent from REX.</Label>
			<NumberInput
				id="resourceNumberInput"
				placeholder="number of {rentState.resourceUnit}"
				bind:value={rentState.amount}
				bind:this={resourceNumberInput}
				autofocus
			/>
			{#if rentState.insufficientBalance}
				<p class="text-red-500">Insufficient balance. Please enter a smaller amount.</p>
			{/if}
		</fieldset>

		{#if rentState.balance}
			<p>
				Available:{rentState.balance}
			</p>
		{/if}
		{#if rentState.pricePerUnit}
			<p>
				Price:{rentState.pricePerUnit}
			</p>
		{/if}

		{#if rentState.error}
			<p class="text-red-500">
				Error: {rentState.error}
			</p>
		{/if}
		<Button type="submit" class="mt-4 w-full" disabled={!recipienteValid || !rentState.valid()}>
			{#if rentState.amount && rentState.cost}
				Rent {rentState.amount}{rentState.resourceUnit} for {rentState.cost}
			{:else}
				Rent
			{/if}
		</Button>
	</Stack>
</form>
