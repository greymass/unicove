<script lang="ts">
	import LegacyTokenSwap from './components/legacy-token-swap.svelte';
	import Articles from './components/articles.svelte';
	import Hero from './components/hero.svelte';
	import Carousel from './components/carousel.svelte';
	import StakingRewards from './components/staking-rewards.svelte';
	import Charts from './components/charts.svelte';
	import PerformanceGrid from './components/performance-grid.svelte';
	import type { UnicoveContext } from '$lib/state/client.svelte';
	import { getContext } from 'svelte';

	const { data } = $props();
	const { network } = getContext<UnicoveContext>('state');

	let networkLogo = $derived(String(data.network.config.logo));
	let networkName = $derived(String(data.network.config.name));
	let productName = $derived(String(data.network.config.metamask?.name));
	let networkShortname = $derived(String(data.network));
</script>

<div id="homepage" class="mb-4 grid content-start items-start gap-y-12 sm:gap-y-32 md:pt-0">
	<Hero {networkName} {networkShortname} />

	<LegacyTokenSwap {network} />

	{#if data.articles.length}
		<Articles articles={data.articles} />
	{/if}

	{#if network.supports('metamask') && productName}
		<Carousel {networkLogo} {networkName} {productName} />
	{/if}

	{#if network.supports('staking')}
		<StakingRewards network={data.network} />
	{/if}

	<Charts />

	<PerformanceGrid {networkLogo} {networkName} network={data.network} />
</div>

{#if networkShortname === 'vaulta'}
	<!-- Noise -->
	<svg
		xmlns="http://www.w3.org/2000/svg"
		xmlns:xlink="http://www.w3.org/1999/xlink"
		width="300"
		height="300"
		class="hidden"
	>
		<filter id="nd" x="0" y="0" width="100%" height="100%">
			<feTurbulence type="fractalNoise" baseFrequency="0.9" />
			<feDisplacementMap in="turbulence" scale="1000" />
			<feBlend in="SourceGraphic" mode="multiply" />
		</filter>

		<filter id="nl" x="0" y="0" width="100%" height="100%">
			<feTurbulence type="fractalNoise" baseFrequency="0.9" />
			<feDisplacementMap in="turbulence" scale="1000" />
			<feBlend in="SourceGraphic" mode="screen" />
		</filter>
	</svg>

	<style>
		body {
			position: relative;
			contain: paint;
		}

		#site-logo,
		#side-menu a {
			color: var(--color-on-surface);
			fill: var(--color-on-surface);
		}

		[data-scheme='light'] {
			body::before {
				background: linear-gradient(to bottom, transparent 60svh, var(--color-background) 95svh),
					radial-gradient(
						farthest-side at 150% 30%,
						var(--color-background),
						#2e3bff30 30%,
						oklch(from var(--color-primary) l c calc(h - 10) / 0.4) 45%,
						oklch(from var(--color-primary) l c calc(h - 10) / 0.6) 50%,
						transparent 65%
					),
					radial-gradient(
						circle at top 0rem left -60%,
						var(--color-background),
						#2e3bff50 5%,
						oklch(from var(--color-primary) l c calc(h - 10) / 0.9) 10%,
						transparent 50%
					),
					var(--color-background);
				background-repeat: no-repeat;
				background-size:
					100% 100%,
					100% 300vh,
					100% 100vh;
				position: absolute;
				inset: 0;
				content: '';
				filter: url(#nl);
			}
		}

		body::before {
			background: linear-gradient(to bottom, transparent 70svh, var(--color-background) 90svh),
				radial-gradient(
					farthest-side at 150% 30%,
					#190d1c 40%,
					#2e3bff30 45%,
					#667cff80 52%,
					transparent 65%
				),
				radial-gradient(
					circle at top 0rem left -50%,
					#190d1c 10%,
					#2e3bff50 15%,
					#667cff30 35%,
					transparent 50%
				),
				#190d1c;
			background-repeat: no-repeat;
			background-size:
				100% 100%,
				100% 300vh,
				100% 100vh;
			position: absolute;
			inset: 0;
			content: '';
			filter: url(#nd);
		}

		/* Safari can't use the noise filter */
		@supports (-webkit-hyphens: none) {
			body::before {
				filter: none;
			}
		}
	</style>
{/if}
