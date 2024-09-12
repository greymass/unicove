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
	interface Props {
		resourceType: ResourceType;
		network: NetworkState;
	}
	const { resourceType, network }: Props = $props();
	const rentState: RentState = $state(new RentState(network.chain, resourceType, RentType.POWERUP));

	let rentRecipient: RentRecipient | undefined = $state();
	let recipienteValid = $state(true);

	$effect(() => {
		if (context.account && context.network) {
			if (context.account.name) {
				rentState.setAccount(context.account.name);
			}
			if (context.network.powerupstate && context.network.sampledUsage) {
				if (resourceType === ResourceType.CPU) {
					rentState.frac = context.network.powerupstate.cpu.frac_by_ms(
						context.network.sampledUsage,
						Number(rentState.amount)
					);
				} else {
					rentState.frac = context.network.powerupstate.net.frac_by_kb(
						context.network.sampledUsage,
						Number(rentState.amount)
					);
				}
			}
			rentState.balance = context.account.balance ? context.account.balance.liquid : undefined;
			rentState.pricePerUnit = context.network.powerupprice;
		} else {
			rentState.reset();
		}
	});

	let resourceNumberInput: NumberInput | undefined = $state();
	let transactionId: Checksum256 | undefined = $state();

	function handleRent() {
		if (!context.wharf || !context.wharf.session || !context.network) {
			alert('Not logged in');
			return;
		}

		try {
			rentState.resetBeforeTransction();
			const rentData = rentState.getActionData();
			const rentAction = context.network.contracts.system.action(
				rentState.getActionName(),
				rentData
			);
			context.wharf
				.transact({
					action: rentAction
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
	}
</script>

{#if transactionId}
	<Transaction {network} {transactionId} />
{/if}

<form onsubmit={preventDefault(handleRent)}>
	<Stack class="gap-3">
		<RentRecipient
			bind:this={rentRecipient}
			payer={rentState.payer}
			bind:receiver={rentState.receiver}
			bind:valid={recipienteValid}
		/>
		<fieldset class="grid gap-2">
			<Label for="numberInput">Amount of {rentState.resourceUnit} to rent from PowerUp.</Label>
			<NumberInput
				id="resourceNumberInput"
				placeholder={`number of ${rentState.resourceUnit}`}
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
