<script lang="ts">
	import { onMount } from 'svelte';
	import { Asset } from '@wharfkit/antelope';

	const { data } = $props();

	interface RamPriceData {
		date: Date;
		value: number;
	}

	let historicalPrices: RamPriceData[] = $state([]);

	onMount(async () => {
		try {
			const response = await fetch('https://unicove-eos.greymass.io/api/marketprice/ram');
			const parsedResponse = await response.json();
			historicalPrices = parsedResponse
				.map((price: RamPriceData) => ({
					date: new Date(price.date),
					value: Asset.from(price.value / 10000, data.network.chain.systemToken?.symbol || '4,EOS')
				}))
				.sort((a: RamPriceData, b: RamPriceData) => b.date.getTime() - a.date.getTime());
		} catch (error) {
			console.error('Error fetching historical RAM prices:', error);
		}
	});
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

<h2>Historical RAM Prices</h2>
{#if historicalPrices.length > 0}
	<table class="float-left max-w-lg border-collapse">
		<thead>
			<tr class="bg-gray-60">
				<th class="border p-1 text-left">Date</th>
				<th class="border p-1 text-left">Price</th>
			</tr>
		</thead>
		<tbody>
			{#each historicalPrices as price}
				<tr class="hover:bg-gray-50">
					<td class="border p-1">{price.date.toLocaleString()}</td>
					<td class="border p-1">{price.value.toString()}</td>
				</tr>
			{/each}
		</tbody>
	</table>
{:else}
	<p>Loading historical RAM prices...</p>
{/if}
