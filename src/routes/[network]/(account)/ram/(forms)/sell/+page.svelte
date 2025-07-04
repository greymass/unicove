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
	import * as m from '$lib/paraglide/messages';

	import { SellRAMState } from './state.svelte';
	import { preventDefault } from '$lib/utils';
	import { DD, DL, DLRow } from 'unicove-components';

	let bytesInput: BytesInput | undefined = $state();
	let assetInput: AssetInput | undefined = $state();

	const context = getContext<UnicoveContext>('state');
	const { data } = $props();

	const sellRamState: SellRAMState = $state(new SellRAMState(data.network.chain));
	const ramAvailableSize = $derived(context.account?.resources.ram.available || Int64.from(0));

	let transactionId: Checksum256 | undefined = $state();
	let errorMessage: string | undefined = $state();
	let ready = $derived(sellRamState.valid && !context.wharf.transacting);

	async function handleSellRAM() {
		if (!context.wharf || !context.wharf.session) {
			alert('Not logged in');
			return;
		}

		return context.wharf
			.transact({
				action: data.network.contracts.system.action('sellram', sellRamState.toJSON())
			})
			.then((transactionResult) => {
				transactionId = transactionResult.resolved?.transaction.id;
				resetState();
			})
			.catch((error) => {
				errorMessage = error;
				console.error(error);
			});
	}

	function resetState() {
		errorMessage = undefined;
		sellRamState.reset();
		bytesInput?.reset();
		assetInput?.set(null);
	}

	$effect(() => {
		if (context.account) {
			if (context.account.name) {
				sellRamState.account = context.account.name;
			}
			sellRamState.max = Number(context.account.resources.ram.available || 0);
		}
	});

	$effect(() => {
		if (data.network.resources.ram.price.rammarket) {
			sellRamState.pricePerKB = data.network.resources.ram.price.rammarket;
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
					<p class="text-error">{m.form_validation_insufficient_balance({ unit: 'RAM' })}</p>
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

			<Button type="submit" class="mt-4 w-full" disabled={!ready}>
				{m.common_unit_sell({ unit: 'RAM' })}
			</Button>

			<Stack class="gap-3">
				<DL>
					<DLRow
						title={` ${m.common_labeled_unit_price({ unit: `${context.network.chain.systemToken?.symbol.name}/RAM` })} (KB) `}
					>
						<DD>
							<AssetText variant="full" value={sellRamState.pricePerKB} />
						</DD>
					</DLRow>

					<DLRow title={m.ram_to_sell()}>
						<DD>
							<AssetText variant="full" value={sellRamState.kbsToSell} />
						</DD>
					</DLRow>

					<DLRow title={m.total_proceeds()}>
						<DD>
							<AssetText variant="full" value={sellRamState.bytesValue} />
						</DD>
					</DLRow>

					<DLRow title={` ${m.common_network_fees()} (0.5%) `}>
						<DD>
							<AssetText variant="full" value={sellRamState.fee} />
						</DD>
					</DLRow>

					<DLRow title={m.common_expected_receive()}>
						<DD>
							<AssetText variant="full" value={sellRamState.expectedToReceive} />
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
</Stack>
