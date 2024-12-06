<script lang="ts">
	import { getContext } from 'svelte';
	import { Checksum256 } from '@wharfkit/antelope';

	import type { UnicoveContext } from '$lib/state/client.svelte';

	import SummaryBuyRAMBytes from '$lib/components/summary/eosio/buyrambytes.svelte';
	import SummaryBuyRAM from '$lib/components/summary/eosio/buyram.svelte';

	import Button from '$lib/components/button/button.svelte';
	import Code from '$lib/components/code.svelte';
	import Label from '$lib/components/input/label.svelte';
	import Stack from '$lib/components/layout/stack.svelte';
	import TransactionSummary from '$lib/components/transactionSummary.svelte';
	import AssetInput from '$lib/components/input/asset.svelte';
	import BytesInput from '$lib/components/input/bytes.svelte';
	import AssetText from '$lib/components/elements/asset.svelte';
	import RamResource from '$lib/components/elements/ramresource.svelte';
	import * as m from '$lib/paraglide/messages';

	import { BuyRAMState } from './state.svelte';
	import { calAvailableSize, preventDefault } from '$lib/utils';
	import { DD, DL, DLRow } from '$lib/components/descriptionlist';

	let bytesInput: BytesInput | undefined = $state();
	let assetInput: AssetInput | undefined = $state();

	const context = getContext<UnicoveContext>('state');
	const { data } = $props();

	const buyRamState: BuyRAMState = $state(new BuyRAMState(data.network.chain));
	const ramAvailableSize = $derived(calAvailableSize(context.account?.ram));

	let transactionId: Checksum256 | undefined = $state();

	async function handleBuyRAM() {
		if (!context.wharf || !context.wharf.session) {
			alert(m.common_not_logged_in());
			return;
		}

		try {
			const transactionResult = await context.wharf.transact({
				action: data.network.contracts.system.action(
					buyRamState.format === 'asset' ? 'buyram' : 'buyrambytes',
					buyRamState.toJSON()
				)
			});

			transactionId = transactionResult.resolved?.transaction.id;

			resetState();
		} catch (error) {
			console.error(error);
		}
	}

	function resetState() {
		buyRamState.reset();
		bytesInput?.reset();
		assetInput?.reset();
	}

	$effect(() => {
		if (context.account) {
			if (context.account.name) {
				buyRamState.payer = context.account.name;
				buyRamState.receiver = context.account.name;
			}

			if (context.account.balance) {
				buyRamState.balance = context.account.balance?.liquid;
			}
		}
	});

	$effect(() => {
		if (data.network.ramprice) {
			buyRamState.pricePerKB = data.network.ramprice.eos;
		}
	});

	function setAssetAmount() {
		buyRamState.format = 'asset';
		buyRamState.bytes = buyRamState.expectedBytes;
	}

	function setBytesAmount() {
		buyRamState.format = 'bytes';
		buyRamState.tokens = buyRamState.bytesValue;
		assetInput?.set(buyRamState.bytesValue);
	}
</script>

<Stack>
	{#if transactionId}
		<TransactionSummary {transactionId} />
	{:else}
		<form onsubmit={preventDefault(handleBuyRAM)} class="mx-auto max-w-2xl space-y-4">
			<RamResource class="hidden" ramAvailable={ramAvailableSize} />

			<Stack class="gap-3">
				<Label class="text-lg" for="bytesInput">{m.ram_form_buy_amount()}</Label>
				<div class="flex gap-4">
					<div class="flex-1">
						<BytesInput
							autofocus
							bind:value={buyRamState.bytes}
							bind:this={bytesInput}
							oninput={setBytesAmount}
						/>
					</div>
					<div class="flex-1">
						<AssetInput
							bind:value={buyRamState.tokens}
							bind:this={assetInput}
							oninput={setAssetAmount}
						/>
					</div>
				</div>
				{#if buyRamState.insufficientBalance}
					<p class="text-red-500">
						{m.form_validation_insufficient_balance({
							unit: String(context.network.chain.systemToken?.symbol.name)
						})}
					</p>
				{/if}
				<p class="text-right">
					{m.common_balance()}
					{#if context.account}
						{context.account.balance?.liquid}
					{:else}
						0.0000 {data.network.chain.systemToken?.symbol.code || ''}
					{/if}
				</p>
			</Stack>

			<Button type="submit" class="mt-4 w-full" disabled={!buyRamState.valid}>
				{m.common_unit_buy({ unit: 'RAM' })}
			</Button>

			<Stack class="gap-3">
				<DL>
					<DLRow
						title={`${m.common_labeled_unit_price({ unit: `${context.network.chain.systemToken?.symbol.name}/RAM` })} (KB) `}
					>
						<DD>
							<AssetText variant="full" value={buyRamState.pricePerKB} />
						</DD>
					</DLRow>

					<DLRow title={m.ram_to_purchase()}>
						<DD>
							<AssetText variant="full" value={buyRamState.kbs} />
						</DD>
					</DLRow>

					<DLRow title={m.ram_purchase_value()}>
						<DD>
							<AssetText variant="full" value={buyRamState.bytesValue} />
						</DD>
					</DLRow>

					<DLRow title={`${m.common_network_fees()} (0.5%)`}>
						<DD>
							<AssetText variant="full" value={buyRamState.fee} />
						</DD>
					</DLRow>

					<DLRow title={m.common_total_cost()}>
						<DD>
							<AssetText variant="full" value={buyRamState.bytesCost} />
						</DD>
					</DLRow>
				</DL>

				{#if buyRamState.valid}
					{#if buyRamState.format === 'asset'}
						<SummaryBuyRAM class="hidden" action={{ data: buyRamState.toJSON() }} />
					{:else}
						<SummaryBuyRAMBytes class="hidden" action={{ data: buyRamState.toJSON() }} />
					{/if}
				{/if}
			</Stack>
		</form>
	{/if}
</Stack>

{#if context.settings.data.debugMode}
	<h3 class="h3">{m.common_debugging()}}</h3>
	<Code
		>{JSON.stringify(
			{
				payer: buyRamState.payer,
				receiver: buyRamState.receiver,
				bytes: buyRamState.bytes,
				balance: buyRamState.balance,
				chain: buyRamState.chain,
				pricePerKB: buyRamState.pricePerKB,
				pricePerByte: buyRamState.pricePerByte,
				bytesValue: buyRamState.bytesValue,
				valid: buyRamState.valid,
				insufficientBalance: buyRamState.insufficientBalance,
				balances: context.account?.balances
			},
			undefined,
			2
		)}</Code
	>
{/if}
