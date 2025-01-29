<script lang="ts">
	import Stack from '$lib/components/layout/stack.svelte';
	import NumberInput from '$lib/components/input/number.svelte';
	import Label from '$lib/components/input/label.svelte';
	import NameInput from '$lib/components/input/name.svelte';
	import AssetText from '$lib/components/elements/asset.svelte';
	import Checkbox from '$lib/components/input/checkbox.svelte';
	import Button from '$lib/components/button/button.svelte';
	import TransactionSummary from '$lib/components/transactionSummary.svelte';
	import CpuAndNetResource from '$lib/components/elements/cpunetresource.svelte';

	import { Checksum256, type TransactResult } from '@wharfkit/session';

	import { getContext } from 'svelte';
	import type { UnicoveContext } from '$lib/state/client.svelte';
	import type { NetworkState } from '$lib/state/network.svelte';
	import type { AccountState } from '$lib/state/client/account.svelte';
	import type { PowerUpState } from '@wharfkit/resources';

	import * as m from '$lib/paraglide/messages';
	import { calAvailableSize, preventDefault } from '$lib/utils';
	import { RentState } from './state.svelte';
	import { getCpuAndNetPrice, getPowerupFrac, type RentType } from './utils';

	const context = getContext<UnicoveContext>('state');

	interface Props {
		rentType: RentType;
		network: NetworkState;
		account?: AccountState;
	}

	const { rentType, network, account }: Props = $props();

	const cpuAvailableSize = $derived(calAvailableSize(context.account?.cpu));
	const netAvailableSize = $derived(calAvailableSize(context.account?.net));
	const usableTime = $derived.by(() => {
		if (rentType === 'POWERUP') return m.resources_usable_time_24h();
		if (rentType === 'REX') return m.resources_usable_time_30days();
		return m.resources_usable_time_until_unstaked();
	});

	$effect(() => {
		if (account && network) {
			if (account.name) {
				rentState.payer = account.name;
			}
			const stateType =
				rentType === 'POWERUP'
					? network.powerupstate
					: rentType === 'REX'
						? network.rexstate
						: network.sampledUsage?.account;
			if (stateType && network.sampledUsage && network.chain.systemToken) {
				if (rentType === 'POWERUP') {
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

	let cpuAmountInput: NumberInput | undefined = $state();
	let netAmountInput: NumberInput | undefined = $state();
	let receiverNameInput: NameInput | undefined = $state();

	const rentState: RentState = $state(new RentState(network.chain, rentType));
	const rentDetails = $derived.by(() => {
		const details = [];
		details.push({ title: m.common_usable_for(), desc: usableTime });
		details.push({
			title: m.common_balance_available(),
			desc: `${rentState.balance.quantity} ${rentState.balance.symbol.name}`
		});
		details.push({
			title: m.common_total_cost(),
			desc: `${rentState.cost.quantity} ${rentState.cost.symbol.name}`
		});
		return details;
	});

	const precision = 2;
	let transactionId: Checksum256 | undefined = $state();

	function handleRent() {
		if (!context.wharf || !context.wharf.session || !context.network) {
			alert('Not logged in');
			return;
		}

		try {
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
					console.error(error);
				});
		} catch (error) {
			console.error(error);
		}
	}

	function resetStateAfterTrasaction() {
		rentState.resetAfterTransction();
		cpuAmountInput?.set();
		netAmountInput?.set();
	}
</script>

{#if transactionId}
	<div class="pb-6"><TransactionSummary {transactionId} /></div>
{/if}

<div class="mx-auto max-w-md space-y-3">
	<CpuAndNetResource cpuAvailable={cpuAvailableSize} netAvailable={netAvailableSize} {precision} />
	<form onsubmit={preventDefault(handleRent)}>
		<Stack class="py-4 sm:p-4 ">
			<fieldset class="grid gap-4">
				<Label for="cpuNumberInput"
					>{m.common_resouce_amount({ resource: 'CPU' })}
					{#if rentState.cpuPricePerMs}
						(<AssetText variant="full" value={rentState.cpuPricePerMs} />/MS){/if}</Label
				>
				<NumberInput
					bind:this={cpuAmountInput}
					id="cpuNumberInput"
					unit="ms"
					bind:value={rentState.cpuAmount}
					placeholder="0"
				/>
			</fieldset>

			<fieldset class="grid gap-4">
				<Label for="netNumberInput"
					>{m.common_resouce_amount({ resource: 'NET' })}
					{#if rentState.netPricePerKb}
						(<AssetText variant="full" value={rentState.netPricePerKb} />/KB){/if}</Label
				>
				<NumberInput
					bind:this={netAmountInput}
					id="netNumberInput"
					unit="kb"
					bind:value={rentState.netAmount}
					placeholder="0"
				/>
			</fieldset>

			<fieldset class="flex items-center gap-3">
				<Checkbox id="rentForSelf" bind:checked={rentState.rentingForSelf} />
				<Label for="rentForSelf">{m.resources_rent_for_self()}</Label>
			</fieldset>

			{#if !rentState.rentingForSelf}
				<fieldset class="semi-bold grid gap-4">
					<Label for="thirdReceiver">{m.send_receiving_account()}</Label>
					<NameInput
						id="thirdReceiver"
						bind:this={receiverNameInput}
						bind:value={rentState.thirdReceiver}
						bind:valid={rentState.thirdReceiverValid}
						placeholder={m.resources_rent_receiving_placeholder()}
					/>
				</fieldset>
			{/if}

			{#if rentState.insufficientBalance}
				<p class="text-red-500">Insufficient balance. Please enter a smaller amount.</p>
			{/if}
			<Button type="submit" class="w-full" disabled={!rentState.valid}>
				{#if rentState.cost.value}
					{m.resources_rent_confirm_with_cost({ cost: rentState.cost })}
				{:else}
					{m.resources_rent_confirm()}
				{/if}
			</Button>
		</Stack>
	</form>

	<Stack class="sm:px-4">
		<ul>
			{#each rentDetails as detail}
				<!-- TODO: Color audit -->
				<li
					class="flex justify-between border-b border-mineShaft-300/10 bg-gradient-to-r from-transparent to-transparent py-3 last:border-none odd:via-mineShaft-950"
				>
					<span class="text-base font-medium">{detail.title}</span>
					<span class="text-base font-medium text-white">{detail.desc}</span>
				</li>
			{/each}
		</ul>
	</Stack>
</div>
{#if context.settings.data.debugMode}
	<div class="mx-auto mt-6 max-w-md border-2 border-skyBlue-500 p-6">
		<h3 class="h3 text-center">Debug Info</h3>
		<table class="table-styles">
			<tbody>
				{#each rentState.getDebugInfo() as item}
					<tr>
						<td class="text-left">{item[0]}</td>
						<td class="text-right">{item[1]}</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
{/if}
