<script lang="ts">
	import { Asset, Int64 } from '@wharfkit/session';
	import Card from '$lib/components/layout/box/card.svelte';
	import RAM from '$lib/components/elements/ram.svelte';
	import { calculateValue } from '$lib/state/client/account.svelte';

	const { data } = $props();
</script>

{#if data.account}
	<h3 class="mb-4">Account RAM</h3>
	<div class="grid grid-cols-1 gap-4 md:grid-cols-3">
		<Card class="rounded-lg bg-gray-600 p-4 shadow">
			<h4 class="mb-2 text-lg font-semibold">Total:</h4>
			<ul class="space-y-2">
				<li><RAM bytes={Number(data.account.ram?.max || 0)} /></li>
				{#if data.account.network.ramprice}
					<li>
						{calculateValue(
							Asset.fromUnits(data.account.ram?.max, '3,RAM'),
							data.account.network.ramprice.eos
						)}
					</li>
					{#if data.account.network.ramprice.usd}
						<li>
							{calculateValue(
								Asset.fromUnits(data.account.ram?.max, '3,RAM'),
								data.account.network.ramprice.usd
							)}
						</li>
					{/if}
				{/if}
			</ul>
		</Card>
		<Card class="rounded-lg bg-gray-600 p-4 shadow">
			<h4 class="mb-2 text-lg font-semibold">Available:</h4>
			<ul class="space-y-2">
				<li><RAM bytes={Number(data.account.ram?.available || 0)} /></li>
				{#if data.account.network.ramprice}
					<li>
						{calculateValue(
							Asset.fromUnits(data.account.ram?.available, '3,RAM'),
							data.account.network.ramprice.eos
						)}
					</li>
					{#if data.account.network.ramprice.usd}
						<li>
							{calculateValue(
								Asset.fromUnits(data.account.ram?.available, '3,RAM'),
								data.account.network.ramprice.usd
							)}
						</li>
					{/if}
				{/if}
			</ul>
		</Card>
		<Card class="rounded-lg bg-gray-600 p-4 shadow">
			<h4 class="mb-2 text-lg font-semibold">Used:</h4>
			<ul class="space-y-2">
				<li><RAM bytes={Number(data.account.ram?.used || 0)} /></li>
				{#if data.account.network.ramprice}
					<li>
						{calculateValue(
							Asset.fromUnits(data.account.ram?.used, '3,RAM'),
							data.account.network.ramprice.eos
						)}
					</li>
					{#if data.account.network.ramprice.usd}
						<li>
							{calculateValue(
								Asset.fromUnits(data.account.ram?.used, '3,RAM'),
								data.account.network.ramprice.usd
							)}
						</li>
					{/if}
				{/if}
			</ul>
		</Card>
	</div>
{:else}
	<p>Loading account RAM details...</p>
{/if}

{#if data.account.network}
	<Card class="mt-4 rounded-lg bg-gray-600 p-4 shadow">
		<h3 class="mb-2 text-xl font-semibold">Current RAM Prices</h3>
		<ul class="space-y-2">
			<li>
				{data.account.network.ramprice?.eos.value || 'N/A'}
				{data.account.network.chain.systemToken.symbol.code}/KB
			</li>
			<li>${data.account.network.ramprice?.usd?.value || 'N/A'} USD/KB</li>
		</ul>
	</Card>
{/if}
