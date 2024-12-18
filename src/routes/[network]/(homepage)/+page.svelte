<script lang="ts">
	import { Card, Stack, Subgrid, Switcher } from '$lib/components/layout';
	import Button from '$lib/components/button/button.svelte';
	import { chainLogos } from '@wharfkit/common';
	import AssetText from '$lib/components/elements/asset.svelte';
	import Hero from './components/hero.svelte';
	import { getContext, type Snippet } from 'svelte';
	import { Asset } from '@wharfkit/antelope';
	import type { UnicoveContext } from '$lib/state/client.svelte';
	import { calculateValue } from '$lib/utils';
	import Carousel from './components/carousel.svelte';
	import StakingRewards from './components/staking-rewards.svelte';
	import Charts from './components/charts.svelte';
	import PerformanceGrid from './components/performance-grid.svelte';

	const { data } = $props();
	const context = getContext<UnicoveContext>('state');
	const { ramPrices, tokenPrices } = $derived(data);

	const tvl = $derived.by(() => {
		const token = Asset.fromUnits(0, data.network.chain.systemToken!.symbol);
		if (data.network.supports('rex') && data.network.rexstate) {
			token.units.add(data.network.rexstate.total_lendable.units);
		}
		if (data.network.supports('rammarket') && data.network.ramstate) {
			token.units.add(data.network.ramstate.quote.balance.units);
		}
		if (data.network.tokenprice) {
			return calculateValue(token, data.network.tokenprice);
		}
		return token;
	});

	let networkLogo = $derived(String(chainLogos.get(data.network?.chain.id.toString())));
	let networkName = $derived(String(data.network.chain.name));
</script>

<Subgrid id="homepage" class="mb-4 content-start items-start gap-y-20 md:pt-0">
	<Hero {networkLogo} {networkName} />

	<Carousel {networkLogo} {networkName} />

	<StakingRewards network={data.network} />

	<Charts {ramPrices} {tokenPrices} network={data.network} />

	<!-- Performance grid -->
	<PerformanceGrid {networkLogo} {networkName} network={data.network} />
</Subgrid>
