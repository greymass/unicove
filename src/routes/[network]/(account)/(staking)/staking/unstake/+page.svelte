<script lang="ts">
	import { Asset } from '@wharfkit/antelope';

	import PillGroup from '$lib/components/navigation/pillgroup.svelte';
	import { Card, Stack, Switcher } from '$lib/components/layout';
	import AssetInput from '$lib/components/input/asset.svelte';
	import Button from '$lib/components/button/button.svelte';
	import Label from '$lib/components/input/label.svelte';
	import Transaction from '$lib/components/transaction.svelte';
	import * as m from '$lib/paraglide/messages.js';
	import type { UnicoveContext } from '$lib/state/client.svelte';
	import { getContext } from 'svelte';
	import { UnstakeState } from './state.svelte';

	const context = getContext<UnicoveContext>('state');
	const { data } = $props();

	let unstakeState: UnstakeState = $state(new UnstakeState(data.network));

	$effect(() => {
		unstakeState.sync(data.network, context.account, context.wharf);
	});
</script>

{#if unstakeState.txid}
	<Transaction network={data.network} transactionId={unstakeState.txid} />
{:else if unstakeState.error}
	<div>
		<h2 class="h2">Transaction Error</h2>
		<p>There was an error submitting your transaction.</p>
	</div>
{:else}
	<Stack class="mx-auto max-w-5xl space-y-8">
		<Switcher>
			<Stack class="gap-3">
				<Label for="assetInput">Amount</Label>
				<Switcher>
					<AssetInput
						autofocus
						bind:this={unstakeState.input}
						bind:min={unstakeState.minValue}
						bind:max={unstakeState.maxValue}
						bind:value={unstakeState.assetValue}
						bind:valid={unstakeState.assetValid}
						bind:validPrecision={unstakeState.assetValidPrecision}
						bind:validMinimum={unstakeState.assetValidMinimum}
						bind:validMaximum={unstakeState.assetValidMaximum}
					/>

					<Button
						disabled={!unstakeState.assetValid}
						onclick={() => unstakeState.transact()}
						variant="secondary"
						class="text-skyBlue-500">Unstake</Button
					>
				</Switcher>

				{#if !unstakeState.assetValid}
					{#if !unstakeState.assetValidPrecision}
						<p class="text-red-500">Invalid number, too many decimal places.</p>
					{/if}
					{#if !unstakeState.assetValidMaximum}
						<p class="text-red-500">Amount exceeds available balance.</p>
					{/if}
				{/if}

				<Label for="quantity-input">
					<button
						class="text-skyBlue-500 hover:text-skyBlue-400"
						onclick={() => {
							unstakeState.setMaxValue();
						}}
						type="button">Available: {unstakeState.unstakable}</button
					>
				</Label>
			</Stack>
		</Switcher>
		<Switcher>
			<Card class="gap-5" title="Details">
				<Stack class="gap-0">
					<div class="grid grid-cols-2 gap-2">
						<p class="caption">In 21 days you can claim</p>
						<p>{unstakeState.assetValid ? unstakeState.assetValue : ''}</p>
						<p class="caption">Lockup</p>
						<p>21 Days</p>
					</div>
				</Stack>
			</Card>

			<Card class="gap-5" title="About unstaking">
				<Stack class="gap-5">
					<p class="caption">
						Unstaking balances will still accrue rewards until they are claimed. However, any
						operation you do (staking more for instance) will automatically claim your fully
						unstaked positions.
					</p>
				</Stack>
			</Card>
		</Switcher>
	</Stack>
{/if}
