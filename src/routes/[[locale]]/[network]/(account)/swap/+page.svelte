<script lang="ts">
	import { getContext } from 'svelte';

	import { Card, Code, Stack } from 'unicove-components';
	import type { MarketContext, UnicoveContext } from '$lib/state/client.svelte.js';

	import { groupSwaps } from './describe.svelte';
	import SwapRow from './components/swaprow.svelte';

	const context = getContext<UnicoveContext>('state');
	const market = getContext<MarketContext>('market');

	const groups = $derived(groupSwaps(context.network, market.market.swaps));
</script>

<Stack class="w-full max-w-3xl">
	{#if !market.market.loaded}
		<Card>
			<Stack class="gap-3">
				{#each { length: 3 }}
					<div class="bg-surface-container-high h-16 w-full animate-pulse rounded-xl"></div>
				{/each}
			</Stack>
		</Card>
	{:else if !groups.length}
		<Card>
			<Stack class="gap-2 py-6 text-center">
				<p class="text-title">No swaps on this network</p>
				<p class="text-muted mx-auto max-w-prose">
					This network has no token swaps configured. Swaps appear here once a RAM market, token
					wrapping, or a legacy token exists.
				</p>
			</Stack>
		</Card>
	{:else}
		{#each groups as group (group.kind)}
			<Card class="gap-3">
				<div class="px-3">
					<h2 class="text-title">{group.label}</h2>
					<p class="text-muted text-sm">{group.caption}</p>
				</div>
				<ul class="-mx-1 grid gap-1">
					{#each group.swaps as swap (`${swap.pair.base.id.url}/${swap.pair.quote.id.url}`)}
						<li>
							<SwapRow {swap} />
						</li>
					{/each}
				</ul>
			</Card>
		{/each}
	{/if}
</Stack>

{#if context.settings.data.debugMode}
	<Code json={market.market.swaps} />
{/if}
