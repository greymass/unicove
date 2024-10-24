<script lang="ts">
	import Stack from '$lib/components/layout/stack.svelte';
	import NumberInput from '$lib/components/input/number.svelte';
	import Label from '$lib/components/input/label.svelte';
	import NameInput from '$lib/components/input/name.svelte';
	import AssetText from '$lib/components/elements/asset.svelte';
	import Checkbox from '$lib/components/input/checkbox.svelte';
	import Button from '$lib/components/button/button.svelte';
	import CpuAndNetOverview from './cpunet.svelte';
	import { preventDefault } from '$lib/utils';
	import { RentState } from './state.svelte';
	import { getCpuAndNetPrice, getPowerupFrac, RentType } from '../utils';
	import type { NetworkState } from '$lib/state/network.svelte';
	import type { AccountState } from '$lib/state/client/account.svelte';
	import { ResourceState } from '../state.svelte';
	import { ResourceType } from '../types';
	import type { PowerUpState } from '@wharfkit/resources';

	import { getContext } from 'svelte';
	import type { UnicoveContext } from '$lib/state/client.svelte';

	const context = getContext<UnicoveContext>('state');

	interface Props {
		rentType: RentType;
		network: NetworkState;
		account?: AccountState;
	}

	const { rentType, network, account }: Props = $props();

	const cpuState = $state(new ResourceState(ResourceType.CPU));
	const netState = $state(new ResourceState(ResourceType.NET));

	$effect(() => {
		cpuState.setResource(account?.cpu);
		netState.setResource(account?.net);
	});

	$effect(() => {
		if (account && network) {
			if (account.name) {
				rentState.payer = account.name;
				rentState.receiver = account.name;
			}
			const stateType =
				rentType === RentType.POWERUP
					? network.powerupstate
					: rentType === RentType.REX
						? network.rexstate
						: network.sampledUsage?.account;
			if (stateType && network.sampledUsage && network.chain.systemToken) {
				if (rentType === RentType.POWERUP) {
					const fracs = getPowerupFrac(stateType as PowerUpState, network.sampledUsage, {
						cpuAmout: Number(rentState.cpuAmount || 0),
						netAmount: Number(rentState.netAmount || 0)
					});
					rentState.cpuFrac = fracs[0];
					rentState.netFrac = fracs[1];
				}
				const prices = getCpuAndNetPrice(
					rentType,
					stateType,
					network.sampledUsage,
					network.chain.systemToken.symbol
				);
				rentState.cpuPricePerMs = prices.cpuPrice;
				rentState.netPricePerKb = prices.netPrice;
			}
			if (account.balance) rentState.balance = account.balance.liquid;
		} else {
			rentState.reset();
		}
	});

	let rentingForSelf = $state(true);
	let receiverInputValid = $state(false);

	let receiverInput: NameInput | undefined = $state();

	const rentState: RentState = $state(new RentState(network.chain, RentType.STAKE));
	const precision = 2;

	function handleRent() {
		if (!context.wharf || !context.wharf.session || !context.network) {
			alert('Not logged in');
			return;
		}

		try {
			rentState.resetBeforeTransction();
			const actions = rentState.getActions(context.network.contracts.system);
		} catch (error) {
			console.error(error);
			alert('rex failed: ' + (error as { message: string }).message);
		}
	}
</script>

<div class="mx-auto max-w-md">
	<div class="p-6">
		<h3 class="h3">test info</h3>
		<p>receiver: {rentState.receiver}</p>
		<p>cpuPricePerMs: {rentState.cpuPricePerMs}, netPricePerKb: {rentState.netPricePerKb}</p>
		<p>liquid: {rentState.balance}</p>

		<h3 class="h3">valid</h3>
		<p>rentingForSelf: {rentingForSelf}</p>
		<p>receiverInputValid: {receiverInputValid}</p>

		<h3 class="h3">Cost</h3>
		<p>cpuAmount: {rentState.cpuAmount}, netAmount: {rentState.netAmount}</p>
		<p>cpu: {rentState.cpuQuantity} net: {rentState.netQuantity}</p>
		<p>cost: {rentState.cost}</p>
		{#if rentType === RentType.POWERUP}
			<p>cpuFrac: {rentState.cpuFrac}, netFrac: {rentState.netFrac}</p>
		{/if}
	</div>
	<CpuAndNetOverview
		cpuAvailable={cpuState.availableSize}
		netAvailable={netState.availableSize}
		{precision}
	/>
	<form onsubmit={preventDefault(handleRent)}>
		<Stack class="py-4 sm:p-4">
			<fieldset class="grid gap-1">
				<Label for="cpuNumberInput"
					>Amount of CPU {#if rentState.cpuPricePerMs}
						(<AssetText variant="full" value={rentState.cpuPricePerMs} />/MS){/if}</Label
				>
				<NumberInput id="cpuNumberInput" bind:value={rentState.cpuAmount} placeholder="0 MS" />
			</fieldset>

			<fieldset class="grid gap-1">
				<Label for="netNumberInput"
					>Amount of NET {#if rentState.netPricePerKb}
						(<AssetText variant="full" value={rentState.netPricePerKb} />/KB){/if}</Label
				>
				<NumberInput id="netNumberInput" bind:value={rentState.netAmount} placeholder="0 KB" />
			</fieldset>

			<fieldset class="flex items-center gap-3">
				<Checkbox id="rentForSelf" bind:checked={rentingForSelf} />
				<Label for="rentForSelf">Rent Resources for my account</Label>
			</fieldset>

			<fieldset class="semi-bold grid gap-1" class:hidden={rentingForSelf}>
				<Label for="to-input">Receiving Account</Label>
				<NameInput
					bind:this={receiverInput}
					bind:value={rentState.receiver}
					bind:valid={receiverInputValid}
					placeholder="Enter the account name"
				/>
			</fieldset>

			{#if rentState.insufficientBalance}
				<p class="text-red-500">Insufficient balance. Please enter a smaller amount.</p>
			{/if}
			<Button type="submit" class="w-full" disabled={!rentState.valid}>
				{#if rentState.cost.value}
					Rent for {rentState.cost}
				{:else}
					Confirm Rent
				{/if}
			</Button>
		</Stack>
	</form>

	<Stack class="sm:px-4">
		<table class="table-styles">
			<tbody>
				<tr>
					<td class="text-left">Usable for</td>
					<td class="text-right"
						>{#if rentType === RentType.POWERUP}24 Hours
						{:else if rentType === RentType.REX}30 Days
						{:else}Until Unstaked
						{/if}
					</td>
				</tr>
				<tr>
					<td class="text-left">Total cost</td>
					<td class="text-right"><AssetText variant="full" value={rentState.cost} /></td>
				</tr>
			</tbody>
		</table>
		<Button variant="secondary" class="w-full">Cancel</Button>
	</Stack>
</div>
