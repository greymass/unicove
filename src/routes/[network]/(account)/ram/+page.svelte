<script lang="ts">
	import RamPriceHistory from '$lib/components/chart/rampricehistory.svelte';
	const { data } = $props();
</script>

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
