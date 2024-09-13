<script lang="ts">
	import RamPriceHistory from '$lib/components/chart/rampricehistory.svelte';
	import RAM from '$lib/components/elements/ram.svelte';
	import { getContext } from 'svelte';
	import type { UnicoveContext } from '$lib/state/client.svelte';
	import Pageheader from '$lib/components/pageheader.svelte';
	import Card from '$lib/components/layout/box/card.svelte';
	import Button from '$lib/components/button/button.svelte';
	import { calculateValue } from '$lib/state/client/account.svelte.js';
	import { Asset } from '@wharfkit/antelope';

	const { data } = $props();
	const context = getContext<UnicoveContext>('state');
</script>

{#if context.account}
	<Pageheader title="Your RAM" subtitle="RAM usage for your account" />
	<Card class="p-4">
		{#if context.account.ram}
			<div class="space-y-4">
				<div class="flex items-center justify-between">
					<span class="text-lg font-semibold">Total RAM:</span>
					<RAM bytes={Number(context.account.ram.max || 0)} />
				</div>
				<div class="border-t pt-4">
					<h4 class="mb-2 text-lg font-semibold">Value:</h4>
					{#if context.account.network.ramprice}
						<div class="flex flex-col space-y-2">
							<div class="flex justify-between">
								<span>Network Token:</span>
								<span
									>{calculateValue(
										Asset.fromUnits(context.account.ram.max, '3,RAM'),
										context.account.network.ramprice.eos
									)}</span
								>
							</div>
							{#if context.account.network.ramprice.usd}
								<div class="flex justify-between">
									<span>USD:</span>
									<span
										>{calculateValue(
											Asset.fromUnits(context.account.ram.max, '3,RAM'),
											context.account.network.ramprice.usd
										)}</span
									>
								</div>
							{/if}
						</div>
					{:else}
						<p class="text-gray-400">RAM price information unavailable</p>
					{/if}
				</div>
			</div>
		{:else}
			<p class="text-center text-gray-400">Loading your RAM information...</p>
		{/if}
	</Card>
	<Button href="/{data.network}/account/{context.account.name}/ram">View Account RAM Details</Button
	>
{:else}
	<Pageheader title="RAM Information" subtitle="Login to view your RAM usage" />
	<Card>To view your RAM usage, please log in or create an account.</Card>
{/if}

{#if data.network && data.network.ramstate}
	<Pageheader title="Current RAM Price" />
	<Card class="p-4">
		<h4 class="mb-2 text-lg font-semibold">Current RAM Price</h4>
		<div class="flex flex-col space-y-2">
			<div class="flex justify-between">
				<span>Network Token:</span>
				<span>{String(data.network.ramstate.price_per_kb(1))}/KB</span>
			</div>
			{#if data.network.ramprice && data.network.ramprice.usd}
				<div class="flex justify-between">
					<span>USD:</span>
					<span>${data.network.ramprice.usd.value}/KB</span>
				</div>
			{/if}
		</div>
	</Card>
{:else}
	<p>Loading current RAM price...</p>
{/if}

{#if data.network.config.features.timeseries}
	{#if data.historicalPrices && data.historicalPrices.length > 0}
		<Pageheader title="Historical RAM Prices" />
		<RamPriceHistory data={data.historicalPrices} />
	{:else}
		<p>No historical RAM prices available.</p>
	{/if}
{/if}
