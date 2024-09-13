<script lang="ts">
	import RamPriceHistory from '$lib/components/chart/rampricehistory.svelte';
	import RAM from '$lib/components/elements/ram.svelte';
	import { getContext } from 'svelte';
	import type { UnicoveContext } from '$lib/state/client.svelte';

	const { data } = $props();
	const context = getContext<UnicoveContext>('state');
</script>

<h3>Your RAM</h3>
{#if context.account && context.account.ram}
	<p>Total: <RAM bytes={Number(context.account.ram.max || 0)} /></p>
	<p>Available: <RAM bytes={Number(context.account.ram.available || 0)} /></p>
	<p>Used: <RAM bytes={Number(context.account.ram.used || 0)} /></p>
{:else}
	<p>Loading your RAM information...</p>
{/if}

<h3>Current RAM Price</h3>
{#if data.network && data.network.ramstate}
	<p>EOS: {String(data.network.ramstate.price_per_kb(1))}</p>
	{#if data.network.ramprice && data.network.ramprice.usd}
		<p>USD: ${data.network.ramprice.usd}</p>
	{/if}
{:else}
	<p>Loading current RAM price...</p>
{/if}

{#if data.network.config.features.timeseries}
	{#if data.historicalPrices.length > 0}
		<h3>Historical RAM Prices</h3>
		<RamPriceHistory data={data.historicalPrices} />
	{:else}
		<p>No historical RAM prices available.</p>
	{/if}
{/if}
