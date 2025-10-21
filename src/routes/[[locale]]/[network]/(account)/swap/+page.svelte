<script lang="ts">
	import { getContext } from 'svelte';

	import { Code } from 'unicove-components';

	import type { MarketContext, UnicoveContext } from '$lib/state/client.svelte.js';
	import AssetText from '$lib/components/elements/asset.svelte';
	import { Button } from 'unicove-components';
	import { SingleCard } from '$lib/components/layout';
	import { Stack } from 'unicove-components';
	import { Asset } from '@wharfkit/session';

	import * as m from '$lib/paraglide/messages';

	const { data } = $props();

	const context = getContext<UnicoveContext>('state');
	const market = getContext<MarketContext>('market');
</script>

{#each market.market.swaps as swap}
	<SingleCard class="col-span-full">
		<Stack>
			<h2 class="text-title">{swap.pair.base.symbol.name} / {swap.pair.quote.symbol.name}</h2>
			<p>
				<AssetText value={Asset.fromFloat(1, swap.pair.base.symbol)} variant="full" />
				=
				{swap.pair.price}
			</p>
			<div class="flex gap-4">
				<Button
					class="border-mine-600 border px-6"
					href={`/${data.network}/swap/${swap.pair.base.id.url}/${swap.pair.quote.id.url}`}
				>
					{m.common_swap()}
				</Button>
			</div>
		</Stack>
	</SingleCard>
{/each}

{#if context.settings.data.debugMode}
	<Code json={market.market.swaps} />
{/if}
