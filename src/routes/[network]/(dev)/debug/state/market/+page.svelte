<script lang="ts">
	import Button from '$lib/components/button/button.svelte';
	import Code from '$lib/components/code.svelte';
	import type { MarketContext } from '$lib/state/client.svelte.js';
	import { getContext } from 'svelte';

	const context = getContext<MarketContext>('market');

	const pairs = $derived(context.market.pairs);
	const refreshed = $derived(context.market.refreshed);
</script>

<h3 class="h3">Trading Pairs</h3>
<p>{refreshed} ({pairs.length} records)</p>
<Button onclick={() => context.market.refresh()}>Refresh</Button>

<h3 class="h3">Pairs</h3>
<Code>
	{#each pairs as pair}
		<p>{pair.base.symbol}-{pair.quote.symbol} @ {pair.price}</p>
	{/each}
</Code>

<h3 class="h3">Context</h3>
<Code>
	{JSON.stringify(context, undefined, 2)}
</Code>
