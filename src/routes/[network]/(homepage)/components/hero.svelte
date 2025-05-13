<script lang="ts">
	import Stack from '$lib/components/layout/stack.svelte';
	import UnicoveWordmark from '$lib/assets/unicove-wordmark.svelte';
	import bgDesktop from '$lib/assets/hero/eos/bg1@2x.png?enhanced';
	import bgMobile from '$lib/assets/hero/eos/bg2@2x.png?enhanced';
	import jungle4 from '$lib/assets/hero/jungle4/logo.svg';
	import telos from '$lib/assets/hero/telos/logo.svg';
	import kylin from '$lib/assets/hero/kylin/logo.webp';
	import vaultaLogo from '$lib/assets/hero/vaulta/vector.svg';
	// import waxLight from '$lib/assets/hero/wax/light.png?enhanced';
	import waxDark from '$lib/assets/hero/wax/dark.png?enhanced';
	import UnicoveOutline from '$lib/assets/unicove-outline.svg';

	import * as m from '$lib/paraglide/messages';
	import Button from '$lib/components/button/button.svelte';

	interface Props {
		networkName: string;
		networkLogo: string;
		networkShortname: string;
	}

	let { networkName, networkShortname }: Props = $props();

	const logo = {
		vaulta: vaultaLogo,
		telos: telos,
		jungle4: jungle4,
		kylin: kylin
	};
</script>

{#if networkShortname === 'eos'}
	{@render eos()}
{:else if networkShortname === 'vaulta'}
	{@render vaulta()}
{:else if networkShortname === 'wax'}
	{@render wax()}
{:else}
	<section id="hero" class="grid gap-y-14 pt-6 md:grid-cols-2 md:items-center">
		<div class="row-start-1 flex justify-center">
			<div id="network-logo" class="relative size-[256px]">
				<!-- Unicove Outline -->
				<img
					class="relative size-3/4 object-contain"
					src={UnicoveOutline}
					alt={networkName}
					fetchpriority="high"
					loading="eager"
					height="512"
					width="512"
				/>

				<!-- Network Logo -->
				<img
					class="absolute right-0 bottom-0 size-3/4 object-contain"
					src={logo[networkShortname as keyof typeof logo]}
					alt={networkShortname}
					fetchpriority="high"
					loading="eager"
					height="512"
					width="512"
				/>
			</div>
		</div>

		<div class="z-10 grid gap-5 md:col-start-1 md:row-start-1">
			{@render textblock()}
		</div>
	</section>
{/if}

{#snippet textblock()}
	<Stack class="grid gap-5">
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
{/snippet}

{#snippet eos()}
	<section id="hero" class="col-span-full grid grid-cols-subgrid gap-y-14 pt-6 md:items-center">
		<!-- Desktop background for EOS -->
		<div id="hero-background" class="col-span-full row-start-1 hidden md:dark:block">
			<enhanced:img
				class="h-auto w-auto object-contain"
				src={bgDesktop}
				alt=""
				fetchpriority="high"
				loading="eager"
			/>
		</div>

		<picture
			id="network-logo"
			class="relative col-span-full row-start-1 -ml-4 grid w-screen place-items-center md:col-start-7 md:ml-0 md:w-auto xl:col-start-6"
		>
			<!-- Network Logo -->
			<img
				class="z-10 w-[41%] max-w-72 object-contain md:w-full"
				src={logo[networkShortname as keyof typeof logo]}
				alt={networkName}
				fetchpriority="high"
				loading="eager"
				height="512"
				width="512"
			/>

			<!-- Mobile background on EOS -->
			<enhanced:img
				class="absolute top-0 left-1/2 hidden -translate-x-1/2 object-contain md:hidden dark:block dark:md:hidden"
				src={bgMobile}
				alt=""
				fetchpriority="high"
				loading="eager"
			/>
		</picture>

		<div
			class="z-10 col-span-full grid gap-5 md:col-span-5 md:col-start-1 md:row-start-1 lg:col-span-4 lg:col-start-1 xl:col-start-2"
		>
			{@render textblock()}
		</div>
	</section>
{/snippet}

{#snippet wax()}
	<section
		id="hero"
		class="relative col-span-full grid grid-cols-2 gap-y-6 overflow-x-clip pt-6 pt-24 md:items-center"
	>
		<div
			id="network-logo"
			class="relative col-span-full md:col-span-1 md:col-start-2 md:row-start-1"
		>
			<!-- Unicove Outline -->
			<img
				class="relative size-3/4 object-contain md:hidden"
				src={UnicoveOutline}
				alt={networkName}
				fetchpriority="high"
				loading="eager"
				height="512"
				width="512"
			/>

			<!-- Network Logo -->
			<enhanced:img
				class="absolute inset-y-0 right-0 size-full object-contain md:relative"
				src={waxDark}
				alt={networkName}
				fetchpriority="high"
				loading="eager"
			/>
		</div>

		<div
			class="col-span-full col-start-1 row-start-2 max-w-xl md:col-span-1 md:col-start-1 md:row-start-1"
		>
			{@render textblock()}
		</div>
	</section>
{/snippet}

{#snippet vaulta()}
	<section
		id="hero"
		class="@container col-span-full grid h-[70svh] place-content-center pt-12 md:pt-0"
	>
		<Stack class="relative grid justify-items-center gap-5  text-center">
			<img
				class="relative z-50 mb-8"
				src={vaultaLogo}
				alt={networkName}
				fetchpriority="high"
				loading="eager"
			/>

			<h1
				class="max-w-128 text-3xl leading-tight font-bold text-balance lg:text-4xl lg:leading-tight"
			>
				<span class="">Unicove.</span>
				{m.homepage_hero_title({
					network: networkName
				})}.
			</h1>
			<p class="text-muted mb-2 text-xl leading-tight text-balance lg:text-xl lg:leading-tight">
				{m.homepage_hero_description({
					network: networkName
				})}
			</p>

			<div class="grid gap-4 @2xl:grid-cols-2">
				<Button variant="primary">Create your Vaulta account</Button>
				<Button
					class="text-primary bg-black/20  backdrop-blur"
					href="https://www.vaulta.com/resources/opening-the-gateway-to-web3-banking"
				>
					About the Vaulta rebrand
				</Button>
			</div>
		</Stack>
	</section>

	<!-- Noise -->
	<svg
		xmlns="http://www.w3.org/2000/svg"
		xmlns:xlink="http://www.w3.org/1999/xlink"
		width="300"
		height="300"
		class="hidden"
	>
		<filter id="n" x="0" y="0" width="100%" height="100%">
			<feTurbulence type="fractalNoise" baseFrequency="0.4" />
			<feColorMatrix type="saturate" values="0" />
			<feBlend in="SourceGraphic" mode="multiply" />
		</filter>
	</svg>

	<style>
		body {
			position: relative;
			contain: paint;
		}

		body::before {
			background: linear-gradient(to bottom, transparent 70svh, var(--color-background) 100svh),
				radial-gradient(
					circle at top 100rem right -100rem,
					#190d1c,
					#190d1c 40%,
					#2e3bff30 50%,
					#667cff80 55%,
					#667cff99 56%,
					#667cff90 57%,
					transparent 65%
				),
				radial-gradient(
					circle at top -0rem left -100rem,
					#190d1c,
					#190d1c 10%,
					#2e3bff50 15%,
					#667cff30 35%,
					transparent 50%
				),
				#190d1c;
			background-repeat: no-repeat;
			position: absolute;
			inset: 0;
			content: '';
			filter: url(#n);
		}

		/* Safari can't use the noise filter */
		@supports (-webkit-hyphens: none) {
			body::before {
				filter: none;
			}
		}
	</style>
{/snippet}
