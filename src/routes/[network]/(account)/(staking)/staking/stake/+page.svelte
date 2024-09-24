<script lang="ts">
	import { Asset, Name } from '@wharfkit/antelope';

	import PillGroup from '$lib/components/navigation/pillgroup.svelte';
	import { Card, Stack, Switcher } from '$lib/components/layout';
	import AssetInput from '$lib/components/input/asset.svelte';
	import Button from '$lib/components/button/button.svelte';
	import Label from '$lib/components/input/label.svelte';
	import Transaction from '$lib/components/transaction.svelte';
	import * as m from '$lib/paraglide/messages.js';
	import type { UnicoveContext } from '$lib/state/client.svelte';
	import { getContext, untrack } from 'svelte';
	import { StakeManager } from './manager.svelte';

	const context = getContext<UnicoveContext>('state');
	const { data } = $props();

	let manager: StakeManager = $state(new StakeManager(data.network));

	$effect(() => {
		manager.sync(data.network, context.account, context.wharf);
	});
</script>

{#if manager.txid}
	<Transaction network={data.network} transactionId={manager.txid} />
{:else if manager.error}
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
						bind:this={manager.input}
						bind:min={manager.minValue}
						bind:max={manager.maxValue}
						bind:value={manager.assetValue}
						bind:valid={manager.assetValid}
						bind:validPrecision={manager.assetValidPrecision}
						bind:validMinimum={manager.assetValidMinimum}
						bind:validMaximum={manager.assetValidMaximum}
					/>
					<Button
						disabled={!manager.assetValid}
						onclick={() => manager.transact()}
						variant="secondary"
						class="text-skyBlue-500">Stake</Button
					>
				</Switcher>

				{#if !manager.assetValid}
					{#if !manager.assetValidPrecision}
						<p class="text-red-500">Invalid number, too many decimal places.</p>
					{/if}
					{#if !manager.assetValidMaximum}
						<p class="text-red-500">Amount exceeds available balance.</p>
					{/if}
				{/if}

				<Label for="quantity-input">
					<button
						class="text-skyBlue-500 hover:text-skyBlue-400"
						onclick={() => {
							manager.setMaxValue();
						}}
						type="button">Available: {manager.stakable}</button
					>
				</Label>
			</Stack>
		</Switcher>
		<Switcher>
			<Card class="gap-5" title="Details">
				<Stack class="gap-0">
					<div class="grid grid-cols-2 gap-2">
						<p class="caption">Minimum lockup</p>
						<p>21 Days</p>
						<p class="caption">~APY</p>
						<p>{manager.apy}%</p>
						<p class="caption">You will stake</p>
						<p>{manager.assetValid ? manager.assetValue : ''}</p>
						<p class="caption">Estimated Yield(per year)</p>
						<p>{manager.assetValid ? manager.estimateYield : ''}</p>
					</div>
				</Stack>
			</Card>

			<Card class="gap-5" title="About staking">
				<Stack class="gap-5">
					<p class="caption">
						The APY is an estimate, and may fluctuate based on how many and much others are staking.
						Your 21 day lockup period starts when you unstake your EOS.
					</p>
					<p class="caption">You will never get back less EOS.</p>
				</Stack>
			</Card>
		</Switcher>
	</Stack>
{/if}
