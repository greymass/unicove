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

{#if data.network.supports('timeseries')}
	{#if data.historicalPrices.length > 0}
		<h3>Historical RAM Prices</h3>
		<RamPriceHistory data={data.historicalPrices} />
		<table class="float-left max-w-lg border-collapse">
			<thead>
				<tr class="bg-gray-60">
					<th class="border p-1 text-left">Date</th>
					<th class="border p-1 text-left">Price</th>
				</tr>
			</thead>
			<tbody>
				{#each data.historicalPrices as price}
					<tr>
						<td class="border p-1">{price.date.toLocaleString()}</td>
						<td class="border p-1">{String(price.value)}</td>
					</tr>
				{/each}
			</tbody>
		</table>
	{:else}
		<p>No historical RAM prices available.</p>
	{/if}
{/if}
