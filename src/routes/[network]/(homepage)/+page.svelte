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

<!-- Vaulta specific homepage styling -->
<svelte:head>
	{#if networkShortname === 'vaulta'}
		<link rel="preload" as="image" href="/images/vaulta/bg-light-lo.webp" fetchpriority="high" />
		<link rel="preload" as="image" href="/images/vaulta/bg-dark-lo.webp" fetchpriority="high" />
	{/if}
	<style>
		[data-theme='vaulta'] {
			body {
				position: relative;
				contain: paint;
				background: var(--vaulta-bg);
				background-repeat: no-repeat;
				background-size:
					100% 100svh,
					100% 100svh,
					100% 100svh,
					100% 100svh,
					auto;
			}

			#site-logo,
			#side-menu a {
				color: var(--color-on-surface);
				fill: var(--color-on-surface);
			}
			&[data-scheme='dark'] {
				--vaulta-bg: linear-gradient(transparent 70%, var(--color-background) 100%),
					url('/images/vaulta/bg-dark.webp'), url('/images/vaulta/bg-dark-lo.webp'),
					url('data:image/jpg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAgICAgJCAkKCgkNDgwODRMREBARExwUFhQWFBwrGx8bGx8bKyYuJSMlLiZENS8vNUROQj5CTl9VVV93cXecnNEBCAgICAkICQoKCQ0ODA4NExEQEBETHBQWFBYUHCsbHxsbHxsrJi4lIyUuJkQ1Ly81RE5CPkJOX1VVX3dxd5yc0f/CABEIADgAZAMBIgACEQEDEQH/xAA0AAEAAwEBAQEAAAAAAAAAAAAAAQUGBAMCBwEAAgMBAQEAAAAAAAAAAAAAAAQCAwUGAQf/2gAMAwEAAhADEAAAAKPl94+gIZjP6TN8to8MTGewAAC5r/0B+iyUrrsy0n654Gezd1n+R1PIJ3ACY6/fL2+56rqc6XYWnqKO0yzNVPV+vjzGkEJAC8ptI3VZ5+0ptVfQOczXaY0yGOAZrIAAe+hNGiKovh3jw//EACUQAAEEAQQCAQUAAAAAAAAAAAEAAgMEERIgITEFIkETIzKBsf/aAAgBAQABPwBpyrLOCrTe1P2Ud/jKLp5G8KGKtXjbGQCQojkKwPVW/lT9lHdXhMjwF46uyrBrI9sKay36h1P5UHSsnDFcdwVM7k7gMleJqjIeQrlgQxfxRsdKC89kqu3gK4/4V6TtSOyd1WLW8Kq0RxheQnMkmlVxiJqADI8q3L2Vbly4onJ3ePjxynyaY8KR2qb9qJ2GBWph+IV+xgEKV+o7oxlwVQaWhTPyCifuqN/oFcmEbCSeVanL3HfAMvCiOGp5UnD8qOQaAv/EACERAAICAgIDAAMAAAAAAAAAAAECAAQDIRESECAxQUJx/9oACAECAQE/ALSaMtffShVNjKBxqDDUQBS68iXGABlp+WPlRyQJW606hyfuRqDCzgMTs7l7Pox27MT5pp2yiXcnKhfwJjcdF/kvO3bjn0o/TLG1i5G6jc//xAAgEQABBAEEAwAAAAAAAAAAAAABAAIDESEQICMxEkFh/9oACAEDAQE/AGHKi2Ty+Dfq5DnKjGVEMak0E/llr0i+sKFiaKGsppqib2URkqACtkyZ2iBa/9k='),
					var(--color-background);
			}
			&[data-scheme='light'] {
				--vaulta-bg: linear-gradient(transparent 70%, var(--color-background) 100%),
					url('/images/vaulta/bg-light.webp'), url('/images/vaulta/bg-light-lo.webp'),
					url('data:image/jpg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wEEEAAPAA8ADwAPABAADwARABMAEwARABgAGQAXABkAGAAjACAAHQAdACAAIwA1ACYAKAAmACgAJgA1AFAAMgA6ADIAMgA6ADIAUABHAFYARgBBAEYAVgBHAH8AZABYAFgAZAB/AJMAewB1AHsAkwCyAJ8AnwCyAOAA1ADgASQBJAGJEQAPAA8ADwAPABAADwARABMAEwARABgAGQAXABkAGAAjACAAHQAdACAAIwA1ACYAKAAmACgAJgA1AFAAMgA6ADIAMgA6ADIAUABHAFYARgBBAEYAVgBHAH8AZABYAFgAZAB/AJMAewB1AHsAkwCyAJ8AnwCyAOAA1ADgASQBJAGJ/8IAEQgAOABkAwEiAAIRAQMRAf/EADEAAQEAAwEBAAAAAAAAAAAAAAAFAgMEAQYBAAMBAQEAAAAAAAAAAAAAAAACAwEFBP/aAAwDAQACEAMQAAAA01odfv8Ams0J1Hl22+kWAAByb/l7rzJrrx8syLqFOlx93ItkJsADVpP+Tq59SPc0I7FucNp86+nHLnWDAAcHdGqsizwVfWsltPmdo8b7hBgAAwinoXDvKZpCn//EACIQAAICAgICAgMAAAAAAAAAAAABAgMEESAxEiEFEyIjMP/aAAgBAQABPwCmZTIpZD+GRcq4svzn9j9lLKH0UkOdklFHyWX2kyvGuuj5xi37KuzHXRQiC5Mzb/GLHCeVkeK637K64UwjBLpGOtsx49FMSK5WS8Ymfa5PSPjsdR9l89WMxq+iiHRVHS55U9RY4/ZZsxo6iX7drKKzHrIrXKXRmSK4FK/Euj+xmPVsrhpc59GR7kRRSW1bmz//xAAhEQABBAEEAwEAAAAAAAAAAAABAAIDESEEICIxEBITQf/aAAgBAgEBPwCdqk2QRGR4C+cDcEjC1BUhzshqGIu/V6F2b7Woku0TZ8xNt4UzuNJp4hTE3sg7UnSDjQX/xAAbEQACAgMBAAAAAAAAAAAAAAAAAQIgEBEhIv/aAAgBAwEBPwBCpJ6R0QqP0zZFUkRxGkhY/9k='),
					var(--color-background);
			}
		}
	</style>
</svelte:head>
