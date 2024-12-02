<script lang="ts">
	import { getContext } from 'svelte';
	import { Checksum256 } from '@wharfkit/antelope';

	import type { UnicoveContext } from '$lib/state/client.svelte';

	import SummarySellRAM from '$lib/components/summary/eosio/sellram.svelte';

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

	import { SellRAMState } from './state.svelte';
	import { calAvailableSize, preventDefault } from '$lib/utils';

	let bytesInput: BytesInput | undefined = $state();
	let assetInput: AssetInput | undefined = $state();

	const context = getContext<UnicoveContext>('state');
	const { data } = $props();

	const sellRamState: SellRAMState = $state(new SellRAMState(data.network.chain));
	const ramAvailableSize = $derived(calAvailableSize(context.account?.ram));

	let transactionId: Checksum256 | undefined = $state();

	async function handleSellRAM() {
		if (!context.wharf || !context.wharf.session) {
			alert('Not logged in');
			return;
		}

		try {
			const transactionResult = await context.wharf.transact({
				action: data.network.contracts.system.action('sellram', sellRamState.toJSON())
			});

			transactionId = transactionResult.resolved?.transaction.id;

			resetState();
		} catch (error) {
			console.error(error);
		}
	}

	function resetState() {
		sellRamState.reset();
		bytesInput?.reset();
		assetInput?.reset();
	}

	$effect(() => {
		if (context.account) {
			if (context.account.name) {
				sellRamState.account = context.account.name;
			}
			sellRamState.max = Number(context.account.ram?.available || 0);
		}
	});

	$effect(() => {
		if (data.network.ramprice) {
			sellRamState.pricePerKB = data.network.ramprice.eos;
		}
	});

	function setAssetAmount() {
		sellRamState.format = 'asset';
		sellRamState.bytes = sellRamState.bytesToSell;
	}

	function setBytesAmount() {
		sellRamState.format = 'bytes';
		sellRamState.tokens = sellRamState.bytesValue;
		assetInput?.set(sellRamState.bytesValue);
	}
</script>

{#if transactionId}
	<TransactionSummary {transactionId} />
{:else}
	<form onsubmit={preventDefault(handleSellRAM)} class="mx-auto max-w-2xl space-y-4">
		<RamResource class="hidden" ramAvailable={ramAvailableSize} />

		<Stack class="gap-3">
			<Label class="text-lg" for="bytesInput">{m.ram_sale_value()}</Label>
			<div class="flex gap-4">
				<div class="flex-1">
					<BytesInput
						autofocus
						bind:value={sellRamState.bytes}
						bind:this={bytesInput}
						oninput={setBytesAmount}
					/>
				</div>
				<div class="flex-1">
					<AssetInput
						bind:value={sellRamState.tokens}
						bind:this={assetInput}
						oninput={setAssetAmount}
					/>
				</div>
			</div>
			{#if sellRamState.insufficientRAM}
				<p class="text-red-500">{m.form_validation_insufficient_balance({ unit: 'RAM' })}</p>
			{/if}
			<p>
				{m.common_labeled_unit_available({ unit: 'RAM' })}
				{#if context.account}
					{sellRamState.maxInKBs}
				{:else}
					0 KB
				{/if}
			</p>
		</Stack>

		<Button type="submit" class="mt-4 w-full" disabled={!sellRamState.valid}>
			{m.common_unit_sell({ unit: 'RAM' })}
		</Button>

		<!-- TODO: use table  -->
		<Stack class="gap-3">
			<div class="mt-4 grid grid-cols-2 gap-y-0 text-lg">
				<p class="text-muted">
					{m.common_labeled_unit_price({
						unit: `${context.network.chain.systemToken?.symbol.name}/RAM`
					})} (KB)
				</p>
				<AssetText variant="full" class="text-right" value={sellRamState.pricePerKB} />

				<div class="col-span-2 my-2 border-b border-mineShaft-900"></div>

				<p class="text-muted">{m.ram_to_sell()}</p>
				<AssetText variant="full" class="text-right" value={sellRamState.kbsToSell} />

				<div class="col-span-2 my-2 border-b border-mineShaft-900"></div>

				<p class="text-muted">{m.total_proceeds()}</p>
				<AssetText variant="full" class="text-right" value={sellRamState.bytesValue} />

				<div class="col-span-2 my-2 border-b border-mineShaft-900"></div>

				<p class="text-muted">{m.common_network_fees()} (0.5%)</p>
				<AssetText variant="full" class="text-right" value={sellRamState.fee} />

				<div class="col-span-2 my-2 border-b border-mineShaft-900"></div>

				<p class="text-muted">{m.common_expected_receive()}</p>
				<AssetText variant="full" class="text-right" value={sellRamState.expectedToReceive} />
			</div>

			{#if sellRamState.valid}
				<SummarySellRAM class="hidden" action={{ data: sellRamState.toJSON() }} />
			{/if}
		</Stack>
	</form>
{/if}

{#if context.settings.data.debugMode}
	<h3 class="h3">{m.common_debugging()}</h3>
	<Code
		>{JSON.stringify(
			{
				account: sellRamState.account,
				bytes: sellRamState.bytes,
				max: sellRamState.max,
				chain: sellRamState.chain,
				pricePerKB: sellRamState.pricePerKB,
				bytesValue: sellRamState.bytesValue,
				insufficientRAM: sellRamState.insufficientRAM,
				valid: sellRamState.valid,
				balances: context.account?.balances
			},
			undefined,
			2
		)}</Code
	>
{/if}
