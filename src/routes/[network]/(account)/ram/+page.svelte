<script lang="ts">
	const { data } = $props();
</script>

<h1>RAM</h1>

<h2>Current RAM Price</h2>
{#if data.network && data.network.ramstate}
	<p>EOS: {data.network.ramstate.price_per_kb(1).toString()}</p>
	{#if data.network.ramprice && data.network.ramprice.usd}
		<p>USD: ${data.network.ramprice.usd}</p>
	{/if}
{:else}
	<p>Loading current RAM price...</p>
{/if}

{#if data.network.config.features.timeseries}
	{#if data.historicalPrices.length > 0}
		<h2>Historical RAM Prices</h2>
		<table class="float-left max-w-lg border-collapse">
			<thead>
				<tr class="bg-gray-60">
					<th class="border p-1 text-left">Date</th>
					<th class="border p-1 text-left">Price</th>
				</tr>
			</thead>
			<tbody>
				{#each data.historicalPrices as price}
					<tr class="hover:bg-gray-50">
						<td class="border p-1">{price.date.toLocaleString()}</td>
						<td class="border p-1">{price.value.toString()}</td>
					</tr>
				{/each}
			</tbody>
		</table>
	{:else}
		<p>No historical RAM prices available.</p>
	{/if}
{/if}
