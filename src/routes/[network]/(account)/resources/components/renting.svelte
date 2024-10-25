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

	import { getSetting } from '$lib/state/settings.svelte.js';

	import { getContext } from 'svelte';
	import type { UnicoveContext } from '$lib/state/client.svelte';
	import { Checksum256, type TransactResult } from '@wharfkit/session';
	import Transaction from '$lib/components/transaction.svelte';

	const context = getContext<UnicoveContext>('state');

	const debugMode = getSetting('debug-mode', true);

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

	let receiverInput: NameInput | undefined = $state();

	const rentState: RentState = $state(new RentState(network.chain, rentType));
	const precision = 2;
	//0ebca2f19920514cb7d1f31f04cbfd279788a06671dd1260b7c00a259e2e85ad
	let transactionId: Checksum256 | undefined = $state();

	function handleRent() {
		if (!context.wharf || !context.wharf.session || !context.network) {
			alert('Not logged in');
			return;
		}

		try {
			rentState.resetBeforeTransction();
			const actions = rentState.getActions(context.network.contracts.system);
			context.wharf
				.transact({
					actions: actions
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
	}
</script>

{#if transactionId}
	<div class="pb-6"><Transaction {network} {transactionId} /></div>
{/if}

<div class="mx-auto max-w-md">
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
				<Checkbox id="rentForSelf" bind:checked={rentState.rentingForSelf} />
				<Label for="rentForSelf">Rent Resources for my account</Label>
			</fieldset>

			<fieldset class="semi-bold grid gap-1" class:hidden={rentState.rentingForSelf}>
				<Label for="to-input">Receiving Account</Label>
				<NameInput
					bind:this={receiverInput}
					bind:value={rentState.thirdReceiver}
					bind:valid={rentState.thirdReceiverValid}
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
		<Button variant="secondary" href="/{network}/resources" class="w-full">Cancel</Button>
	</Stack>
</div>
{#if debugMode}
	<div class="mt-6 mx-auto max-w-md border-2 border-skyBlue-500 p-6">
		<h3 class="h3 text-center">Test Info</h3>
		<table class="table-styles">
			<tbody>
				<tr>
					<td class="text-left">RentType</td>
					<td class="text-right">{rentType}</td>
				</tr>
				<tr>
					<td class="text-left">Balance</td>
					<td class="text-right">{rentState.balance}</td>
				</tr>
				<tr>
					<td class="text-left">Receiver</td>
					<td class="text-right">{rentState.receiver}</td>
				</tr>
				<tr>
					<td class="text-left">RentingForSelf</td>
					<td class="text-right">{rentState.rentingForSelf}</td>
				</tr>
				<tr>
					<td class="text-left">ThirdReceiver</td>
					<td class="text-right">{rentState.thirdReceiver}</td>
				</tr>
				<tr>
					<td class="text-left">ThirdReceiver-Valid</td>
					<td class="text-right">{rentState.thirdReceiverValid}</td>
				</tr>

				<tr>
					<td class="text-left">Valid</td>
					<td class="text-right">{rentState.valid}</td>
				</tr>
				<tr>
					<td class="text-left">CpuAmount</td>
					<td class="text-right">{rentState.cpuAmount}</td>
				</tr>

				<tr>
					<td class="text-left">NetAmount</td>
					<td class="text-right">{rentState.netAmount}</td>
				</tr>
				<tr>
					<td class="text-left">CpuQuantity</td>
					<td class="text-right">{rentState.cpuQuantity}</td>
				</tr>
				<tr>
					<td class="text-left">NetQuantity</td>
					<td class="text-right">{rentState.netQuantity}</td>
				</tr>
				{#if rentType === RentType.POWERUP}
					<tr>
						<td class="text-left">CpuFrac</td>
						<td class="text-right">{rentState.cpuFrac}</td>
					</tr>
					<tr>
						<td class="text-left">NetFrac</td>
						<td class="text-right">{rentState.netFrac}</td>
					</tr>
				{/if}
			</tbody>
		</table>
	</div>
{/if}
