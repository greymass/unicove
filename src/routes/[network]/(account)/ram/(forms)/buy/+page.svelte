<script lang="ts">
	import { getContext } from 'svelte';
	import { Checksum256, Int64 } from '@wharfkit/antelope';

	import type { UnicoveContext } from '$lib/state/client.svelte';

	import { Button } from 'unicove-components';
	import { Code } from 'unicove-components';
	import { Label } from 'unicove-components';
	import { Stack } from 'unicove-components';
	import TransactSummary from '$lib/components/transact/summary.svelte';
	import TransactError from '$lib/components/transact/error.svelte';
	import { AssetInput } from 'unicove-components';
	import { BytesInput } from 'unicove-components';
	import AssetText from '$lib/components/elements/asset.svelte';
	import RamResource from '$lib/components/elements/ramresource.svelte';
	import SystemTokenSwap from '$lib/components/banner/systemTokenSwap.svelte';
	import * as m from '$lib/paraglide/messages';

	import { BuyRAMState } from './state.svelte';
	import { preventDefault } from '$lib/utils';
	import { DD, DL, DLRow } from 'unicove-components';

	let bytesInput: BytesInput | undefined = $state();
	let assetInput: AssetInput | undefined = $state();

	const context = getContext<UnicoveContext>('state');
	const { data } = $props();

	const buyRamState: BuyRAMState = $state(new BuyRAMState(data.network.chain));
	const ramAvailableSize = $derived(context.account?.resources.ram.available || Int64.from(0));

	let transactionId: Checksum256 | undefined = $state();
	let errorMessage: string | undefined = $state();
	let ready = $derived(buyRamState.valid && !context.wharf.transacting);

	async function handleBuyRAM() {
		errorMessage = undefined;
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
			errorMessage = String(error);
			console.error(error);
		}
	}

	function resetState() {
		errorMessage = undefined;
		buyRamState.reset();
		bytesInput?.reset();
		assetInput?.set(null);
	}

	$effect(() => {
		if (context.account) {
			if (context.account.name) {
				buyRamState.payer = context.account.name;
				buyRamState.receiver = context.account.name;
			}

			if (context.account.balance) {
				buyRamState.balance = context.account.balance?.balance;
			}
		}
	});

	$effect(() => {
		if (data.network.resources.ram.price.rammarket) {
			buyRamState.pricePerKB = data.network.resources.ram.price.rammarket;
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
		<TransactSummary {transactionId} />
		<Button href={`/${data.network}/ram`} variant="secondary">
			{m.common_ram_market()}
		</Button>
		<Button href={`/${data.network}/account/${context.account?.name}`}>
			{m.common_view_my_account()}
		</Button>
	{:else if errorMessage}
		<TransactError error={errorMessage} />
		<Button onclick={resetState}>{m.common_close()}</Button>
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
					<p class="text-error">
						{m.form_validation_insufficient_balance({
							unit: String(context.network.chain.systemToken?.symbol.name)
						})}
					</p>
				{/if}
				<p class="text-right">
					{m.common_balance()}
					{#if context.account}
						{context.account.balance?.balance}
					{:else}
						0.0000 {data.network.chain.systemToken?.symbol.code || ''}
					{/if}
				</p>
			</Stack>

			<Button type="submit" class="mt-4 w-full" disabled={!ready}>
				{m.common_unit_buy({ unit: 'RAM' })}
			</Button>

			<SystemTokenSwap account={context.account} network={data.network} />

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
			</Stack>
		</form>
	{/if}
	{#if context.settings.data.debugMode}
		<h3 class="h3">{m.common_debugging()}</h3>
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
</Stack>
