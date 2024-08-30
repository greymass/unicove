<script lang="ts">
	import Input from '$lib/components/input/textinput.svelte';
	import Button from '$lib/components/button/button.svelte';
	import Label from '$lib/components/input/label.svelte';
	import Stack from '$lib/components/layout/stack.svelte';

	import { ResourceType, RentState, RentType } from './state.svelte';

	import { preventDefault } from '$lib/utils';

	import type { UnicoveContext } from '$lib/state/client.svelte';
	import { getContext } from 'svelte';

	const context = getContext<UnicoveContext>('state');

	$effect(() => {
		if (context.account && context.network) {
			rentState.balance = context.account.balance ? context.account.balance.liquid : undefined;
		} else {
			rentState.reset();
		}
	});

	interface Props {
		resourceType: ResourceType;
	}
	const { resourceType }: Props = $props();
	const rentState: RentState = $state(new RentState(resourceType, RentType.REX));

	function handleRent() {}

	$effect(() => {
		console.log('rentState.amount = ', rentState.amount);
	});
</script>

<form on:submit={preventDefault(handleRent)}>
	<Stack class="gap-3">
		<Label>Amount of {rentState.getUnit()} to rent from REX.</Label>
		<Input placeholder={`number of ${rentState.getUnit()}`} bind:value={rentState.amount} />
		{#if rentState.insufficientBalance}
			<p class="text-red-500">Insufficient balance. Please enter a smaller amount.</p>
		{/if}
		{#if rentState.balance}
			<p>
				Available:{rentState.balance}
			</p>
		{/if}
	</Stack>

	<Button type="submit" class="mt-4 w-full">
		{#if rentState.amount && rentState.amountValue}
			Rent {rentState.amount}{rentState.getUnit()} for {rentState.amountValue}
		{:else}
			Rent
		{/if}
	</Button>
</form>
