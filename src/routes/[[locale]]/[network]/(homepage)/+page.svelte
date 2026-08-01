<script lang="ts">
	import Hero from './components/hero.svelte';
	import StakingRewards from './components/staking-rewards.svelte';
	import SentimentShowcase from './components/sentiment-showcase.svelte';
	import Charts from './components/charts.svelte';
	import PerformanceGrid from './components/performance-grid.svelte';
	import Launcher from './components/launcher.svelte';
	import type { UnicoveContext } from '$lib/state/client.svelte';
	import { getContext } from 'svelte';
	import { cn } from '$lib/utils/style';

	const { data } = $props();
	const context = getContext<UnicoveContext>('state');
	const { network } = context;

	let networkLogo = $derived(String(data.network.config.logo));
	let networkName = $derived(String(data.network.config.name));
	let networkShortname = $derived(String(data.network));
</script>

<div
	id="homepage"
	class={cn(
		'mb-4 grid content-start items-start md:pt-0',
		context.account ? 'gap-y-10 sm:gap-y-16' : 'gap-y-12 sm:gap-y-32'
	)}
>
	{#if context.account}
		<Launcher />
	{:else}
		<Hero {networkName} {networkShortname} />
	{/if}

	{#if network.supports('sentiment') && data.sentimentTopics?.length > 0}
		<SentimentShowcase topics={data.sentimentTopics} />
	{/if}

	{#if !context.account}
		{#if network.supports('staking')}
			<StakingRewards network={data.network} />
		{/if}
	{/if}

	<Charts />

	<PerformanceGrid {networkLogo} {networkName} network={data.network} />
</div>
