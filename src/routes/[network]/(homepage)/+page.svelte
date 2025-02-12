<script lang="ts">
	import Subgrid from '$lib/components/layout/subgrid.svelte';
	import { chainLogos } from '@wharfkit/common';
	import Hero from './components/hero.svelte';
	import Carousel from './components/carousel.svelte';
	import StakingRewards from './components/staking-rewards.svelte';
	import Charts from './components/charts.svelte';
	import PerformanceGrid from './components/performance-grid.svelte';
	import type { UnicoveContext } from '$lib/state/client.svelte';
	import { getContext } from 'svelte';

	const { data } = $props();
	const { network } = getContext<UnicoveContext>('state');

	let networkLogo = $derived(String(chainLogos.get(data.network?.chain.id.toString())));
	let networkName = $derived(String(data.network.chain.name));
	let productName = $derived(String(data.network.config.metamask?.name));
	let networkShortname = $derived(String(data.network));
</script>

<Subgrid id="homepage" class="mb-4 content-start items-start gap-y-32 md:pt-0">
	<Hero {networkLogo} {networkName} {networkShortname} />

	{#if network.supports('metamask') && productName}
		<Carousel {networkLogo} {networkName} {productName} />
	{/if}

	{#if network.supports('staking')}
		<StakingRewards network={data.network} />
	{/if}

	<Charts />

	<PerformanceGrid {networkLogo} {networkName} network={data.network} />
</Subgrid>
