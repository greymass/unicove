<script lang="ts">
	import Code from '$lib/components/code.svelte';
	import { onDestroy } from 'svelte';
	import { TokenPriceTicker } from '$lib/state/price-ticker.svelte';
	import type { TokenIdentifier } from '@wharfkit/common';

	const { data } = $props();

	const tokenPriceTicker = TokenPriceTicker.INST;
	onDestroy(() => {
		tokenPriceTicker.stopLoad();
	});

	$effect(() => {
		const tokens: TokenIdentifier[] = [];
		if (data.account.balances) {
			for (const balance of data.account.balances) {
				tokens.push(balance.metadata.id);
			}
		}
		tokenPriceTicker.setTokens(tokens, data.network.chain);
		tokenPriceTicker.startLoad();
	});
</script>

{#if data.account}
	<div class="space-y-4">
		<h3 class="h3">Balances</h3>
		<Code>{JSON.stringify(data.account.balances, null, 2)}</Code>

		<h3 class="h3">System Token Price</h3>
		{#if data.account.network}
			<Code>{JSON.stringify(data.account.network.tokenprice, null, 2)}</Code>
		{/if}

		<h3 class="h3">Other Token Price</h3>
		<Code>{JSON.stringify(tokenPriceTicker.prices)}</Code>
	</div>
{/if}
