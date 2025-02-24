<script lang="ts">
	import { Checksum256, Int64 } from '@wharfkit/antelope';
	import { type TransactResult } from '@wharfkit/session';
	import { getContext } from 'svelte';

	import Stack from '$lib/components/layout/stack.svelte';
	import NumberInput from '$lib/components/input/number.svelte';
	import Label from '$lib/components/input/label.svelte';
	import NameInput from '$lib/components/input/name.svelte';
	import AssetText from '$lib/components/elements/asset.svelte';
	import Checkbox from '$lib/components/input/checkbox.svelte';
	import Button from '$lib/components/button/button.svelte';
	import TransactSummary from '$lib/components/transact/summary.svelte';
	import TransactError from '$lib/components/transact/error.svelte';
	import CpuAndNetResource from '$lib/components/elements/cpunetresource.svelte';

	import type { UnicoveContext } from '$lib/state/client.svelte';
	import type { NetworkState } from '$lib/state/network.svelte';
	import type { AccountState } from '$lib/state/client/account.svelte';

	import * as m from '$lib/paraglide/messages';
	import { preventDefault } from '$lib/utils';
	import { RentState } from './state.svelte';
	import { type RentType } from './utils';

	const context = getContext<UnicoveContext>('state');

	interface Props {
		rentType: RentType;
		network: NetworkState;
		account?: AccountState;
	}

	const { rentType, network, account }: Props = $props();

	const cpuAvailableSize = $derived(context.account?.resources.cpu.available || Int64.from(0));
	const netAvailableSize = $derived(context.account?.resources.net.available || Int64.from(0));
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

			switch (rentType) {
				case 'POWERUP': {
					const fracs = network.getPowerupFrac(
						Number(rentState.cpuAmount || 0),
						Number(rentState.netAmount || 0)
					);
					rentState.cpuFrac = fracs[0];
					rentState.netFrac = fracs[1];
					rentState.cpuPricePerMs = network.resources.cpu.price.powerup;
					rentState.netPricePerKb = network.resources.net.price.powerup;
					break;
				}
				case 'REX': {
					rentState.cpuPricePerMs = network.resources.cpu.price.rex;
					rentState.netPricePerKb = network.resources.net.price.rex;
					break;
				}
				default: {
					break;
				}
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

	let transactionId: Checksum256 | undefined = $state();
	let errorMessage: string | undefined = $state();

	function handleRent() {
		errorMessage = undefined;
		if (!context.wharf || !context.wharf.session || !context.network) {
			alert('Not logged in');
			return;
		}

		const actions = rentState.getActions(network.contracts.system);
		context.wharf
			.transact({
				actions: actions
			})
			.then((result: TransactResult) => {
				transactionId = result.response?.transaction_id;
			})
			.catch((error) => {
				errorMessage = error;
				console.error(error);
			});
	}

	function resetStateAfterTrasaction() {
		transactionId = undefined;
		errorMessage = undefined;
		rentState.resetAfterTransction();
		cpuAmountInput?.set();
		netAmountInput?.set();
	}
</script>

{#if transactionId}
	<TransactSummary {transactionId} />
	<Button href={`/${network}/resources`} variant="secondary">
		{m.common_resources()}
	</Button>
	<Button href={`/${network}/account/${context.account?.name}`}>
		{m.common_view_my_account()}
	</Button>
{:else if errorMessage}
	<TransactError error={errorMessage} />
	<Button onclick={resetStateAfterTrasaction}>{m.common_close()}</Button>
{:else}
	<div class="mx-auto max-w-md space-y-3">
		<CpuAndNetResource cpuAvailable={cpuAvailableSize} netAvailable={netAvailableSize} />
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
{/if}

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
