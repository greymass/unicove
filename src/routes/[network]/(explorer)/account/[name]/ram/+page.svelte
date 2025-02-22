<script lang="ts">
	import { Asset } from '@wharfkit/antelope';
	import Card from '$lib/components/layout/box/card.svelte';
	import RAM from '$lib/components/elements/ram.svelte';
	import { calculateValue } from '$lib/utils';

	const { data } = $props();
</script>

{#if data.account}
	<h3>Account RAM</h3>
	<div class="grid grid-cols-1 gap-6 md:grid-cols-3">
		<Card>
			<h4 class="mb-2 text-lg font-semibold">Total:</h4>
			<ul class="space-y-2">
				<li><RAM bytes={Number(data.account.resources.ram.max || 0)} /></li>
				{#if data.network.resources.ram.price.rammarket}
					<li>
						{calculateValue(
							Asset.fromUnits(data.account.resources.ram.max, '3,RAM'),
							data.network.resources.ram.price.rammarket
						)}
					</li>
				{/if}
			</ul>
		</Card>
		<Card>
			<h4 class="mb-2 text-lg font-semibold">Available:</h4>
			<ul class="space-y-2">
				<li><RAM bytes={Number(data.account.resources.ram.available || 0)} /></li>
				{#if data.network.resources.ram.price.rammarket}
					<li>
						{calculateValue(
							Asset.fromUnits(data.account.resources.ram.available, '3,RAM'),
							data.network.resources.ram.price.rammarket
						)}
					</li>
				{/if}
			</ul>
		</Card>
		<Card>
			<h4 class="mb-2 text-lg font-semibold">Usable:</h4>
			<ul class="space-y-2">
				<li><RAM bytes={Number(data.account.resources.ram.available || 0)} /></li>
				{#if data.network.resources.ram.price.rammarket}
					<li>
						{calculateValue(
							Asset.fromUnits(data.account.resources.ram.available, '3,RAM'),
							data.network.resources.ram.price.rammarket
						)}
					</li>
				{/if}
			</ul>
		</Card>
		<Card>
			<h4 class="mb-2 text-lg font-semibold">Used:</h4>
			<ul class="space-y-2">
				<li><RAM bytes={Number(data.account.resources.ram.used || 0)} /></li>
				{#if data.network.resources.ram.price.rammarket}
					<li>
						{calculateValue(
							Asset.fromUnits(data.account.resources.ram.used, '3,RAM'),
							data.network.resources.ram.price.rammarket
						)}
					</li>
				{/if}
			</ul>
		</Card>
	</div>
{:else}
	<p>Loading account RAM details...</p>
{/if}

{#if data.network}
	<Card>
		<h3 class="mb-2 text-xl font-semibold">Current RAM Prices</h3>
		<ul class="space-y-2">
			<li>
				{data.network.resources.ram.price.rammarket.quantity}
				{data.account.network.chain.systemToken?.symbol.code || ''}/KB
			</li>
		</ul>
	</Card>
{/if}
