<script lang="ts">
	import Input from '$lib/components/input/textinput.svelte';
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
			rentState.coreSymbol = context.network.chain.systemToken!.symbol;
			rentState.balance = context.account.balance ? context.account.balance.liquid : undefined;
			rentState.pricePerUnit = context.network.rexprice;
		} else {
			rentState.reset();
		}
	});

	interface Props {
		resourceType: ResourceType;
	}
	const { resourceType }: Props = $props();
	const rentState: RentState = $state(new RentState(resourceType, RentType.REX));

	function handleRent() {
		if (!context.wharf || !context.wharf.session || !context.network) {
			alert('Not logged in');
			return;
		}

		try {
			const depositData = rentState.getDepositData();
			const depositAction = context.network.contracts.system.action('deposit', depositData);
			const rentData = rentState.getActionData();
			const rentAction = context.network.contracts.system.action(
				rentState.getActionName(),
				rentData
			);
			context.wharf
				.transact({
					// action: rentAction
					actions: [depositAction, rentAction]
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
			<Label>Amount of {rentState.resourceUnit} to rent from REX.</Label>
			<Input placeholder="number of {rentState.resourceUnit}" bind:value={rentState.amount} />
			{#if rentState.insufficientBalance}
				<p class="text-red-500">Insufficient balance. Please enter a smaller amount.</p>
			{/if}
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
		</Stack>

		{#if rentState.error}
			<p class="text-red-500">
				Fee:{rentState.error}
			</p>
		{/if}
		<Button type="submit" class="mt-4 w-full">
			{#if rentState.amount && rentState.cost}
				Rent {rentState.amount}{rentState.resourceUnit} for {rentState.cost}
			{:else}
				Rent
			{/if}
		</Button>
	</form>
{/if}
