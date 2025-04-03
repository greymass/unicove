<script lang="ts">
	import Stack from '$lib/components/layout/stack.svelte';
	import UnicoveWordmark from '$lib/assets/unicove-wordmark.svelte';
	import bgDesktop from '$lib/assets/hero/bg1@2x.png?enhanced';
	import bgMobile from '$lib/assets/hero/bg2@2x.png?enhanced';
	import * as m from '$lib/paraglide/messages';

	interface Props {
		networkName: string;
		networkLogo: string;
		networkShortname: string;
	}

	let { networkName, networkLogo, networkShortname }: Props = $props();
</script>

<section id="hero" class="col-span-full grid grid-cols-subgrid gap-y-14 pt-6 md:items-center">
	{#if networkShortname === 'eos'}
		<div id="hero-background" class="col-span-full row-start-1 hidden md:block">
			<enhanced:img
				class="h-auto w-auto object-contain"
				src={bgDesktop}
				alt=""
				fetchpriority="high"
				loading="eager"
			/>
		</div>
	{/if}

	<picture
		id="network-logo"
		class="relative col-span-full row-start-1 -ml-4 grid w-screen place-items-center md:col-start-7 md:ml-0 md:w-auto xl:col-start-6"
	>
		<img
			class="z-10 w-[41%] max-w-72 object-contain md:w-full"
			src={networkLogo}
			alt={networkName}
			fetchpriority="high"
			loading="eager"
			height="512"
			width="512"
		/>
		{#if networkShortname === 'eos'}
			<enhanced:img
				class="absolute top-0 left-1/2 -translate-x-1/2 object-contain md:hidden"
				src={bgMobile}
				alt=""
				fetchpriority="high"
				loading="eager"
			/>
		{/if}
	</picture>

	<!-- Text block -->
	<Stack
		class="z-10 col-span-full grid gap-5 md:col-span-5 md:col-start-1 md:row-start-1 lg:col-span-4 lg:col-start-1 xl:col-start-2"
	>
		<UnicoveWordmark class="h-7 w-auto md:h-auto" />
		<h1 class="text-3xl leading-tight font-bold text-balance lg:text-4xl lg:leading-tight">
			<span class="sr-only">Unicove:</span>
			{m.homepage_hero_title({
				network: networkName
			})}
		</h1>
		<p class="text-muted mb-2 text-xl leading-tight text-balance lg:text-xl lg:leading-tight">
			{m.homepage_hero_description({
				network: networkName
			})}
		</p>
	</Stack>
</section>
