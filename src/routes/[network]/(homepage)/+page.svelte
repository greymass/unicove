<script lang="ts">
	import Subgrid from '$lib/components/layout/subgrid.svelte';
	import { chainLogos } from '@wharfkit/common';
	import Hero from './components/hero.svelte';
	import Carousel from './components/carousel.svelte';
	import StakingRewards from './components/staking-rewards.svelte';
	import Charts from './components/charts.svelte';
	import PerformanceGrid from './components/performance-grid.svelte';

	const { data } = $props();

	let networkLogo = $derived(String(chainLogos.get(data.network?.chain.id.toString())));
	let networkName = $derived(String(data.network.chain.name));
</script>

<Subgrid id="homepage" class="mb-4 content-start items-start gap-y-32 md:pt-0">
	<Hero {networkLogo} {networkName} />

	<Carousel {networkLogo} {networkName} />

	<StakingRewards network={data.network} />

	<Charts />

	<PerformanceGrid {networkLogo} {networkName} network={data.network} />
</Subgrid>
