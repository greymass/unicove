<script lang="ts">
	import { Box, Card, Stack, Subgrid, Switcher } from '$lib/components/layout';
	import Button from '$lib/components/button/button.svelte';
	import { chainLogos } from '@wharfkit/common';
	import Metamask from '$lib/assets/metamask.svg';
	import EOSPriceHistory from '$lib/components/chart/eospricehistory.svelte';
	import RamPriceHistory from '$lib/components/chart/rampricehistory.svelte';

	import TLVHex from './components/tlvhex.svelte';
	import { onMount, type Snippet } from 'svelte';
	// import { Asset } from '@wharfkit/antelope';
	import type { HistoricalPrice } from '$lib/types';

	const { data } = $props();

	const APR = 99;
	const TLV = 123_456_789;
	const DAU = 843_945;
	const RAM_POOL = 1_234_567;
	const EOS_MARKET_CAP = 1_234_567_890;
	const TPS = 1_234;

	let ramPrices: HistoricalPrice[] = $state([]);
	let tokenPrices: HistoricalPrice[] = $state([]);

	let networkLogo = $derived(String(chainLogos.get(data.network?.chain.id.toString())));
	let networkName = $derived(String(data.network.chain.name));

	// async function loadPrices() {
	// 	const ramResponse: Response = await fetch(`/${data.network}/api/metrics/marketprice/ram`);
	// 	const parsedRamResponse: { date: string; value: number }[] | { error: string } =
	// 		await ramResponse.json();
	// 	if ('error' in parsedRamResponse && parsedRamResponse.error) {
	// 		throw new Error(String(parsedRamResponse.error));
	// 	} else if (Array.isArray(parsedRamResponse)) {
	// 		ramPrices = parsedRamResponse.map((price: { date: string; value: number }) => ({
	// 			date: new Date(price.date),
	// 			value: Asset.from(
	// 				price.value / 10000,
	// 				data.network.chain.systemToken?.symbol || '0,UNKNOWN'
	// 			)
	// 		}));
	// 	}
	// 	const tokenResponse: Response = await fetch(`/${data.network}/api/metrics/marketprice/token`);
	// 	const parsedTokenResponse: { date: string; value: number }[] | { error: string } =
	// 		await tokenResponse.json();
	// 	if ('error' in parsedTokenResponse && parsedTokenResponse.error) {
	// 		throw new Error(String(parsedTokenResponse.error));
	// 	} else if (Array.isArray(parsedTokenResponse)) {
	// 		tokenPrices = parsedTokenResponse.map((price: { date: string; value: number }) => ({
	// 			date: new Date(price.date),
	// 			value: Asset.from(price.value / 10000, '4,USD')
	// 		}));
	// 	}
	// }

	onMount(() => {
		// loadPrices();
	});
</script>

{#snippet textblock(props: {
	title: string;
	text: string;
	children?: Snippet;
	button?: { text: string; href: string };
})}
	<Stack class="max-w-md items-start">
		<h3 class="h3 leading-tight">{props.title}</h3>
		<p>{props.text}</p>
		{#if props.button && props.button.href}
			<Button class="mt-1" href={props.button.href}>{props.button.text}</Button>
		{/if}
		{@render props.children?.()}
	</Stack>
{/snippet}

<Subgrid id="homepage" class="mb-4 content-start items-start gap-y-20 pt-8 sm:pt-12 md:pt-0">
	<!-- <Pageheader title={data.network.chain.name} /> -->

	<!-- Hero -->
	<section
		id="hero"
		class="md:bg-hero-gradient relative col-span-full grid grid-cols-4 items-start gap-x-4 gap-y-10 sm:items-center md:grid-cols-subgrid md:gap-y-4"
	>
		<!-- Text block -->
		<Stack
			class="z-10 col-span-full col-start-1 row-start-1 items-start xs:col-span-3 xs:col-start-1 sm:col-span-3 sm:col-start-1 sm:row-start-1 sm:max-w-sm sm:place-self-center md:col-span-6 md:col-start-1 md:max-w-xl md:place-self-auto"
		>
			<h1 class="text-balance text-3xl font-semibold leading-tight md:text-4xl md:leading-tight">
				Unicove is your gateway to the {networkName} Network
			</h1>
			<p class="text-muted mb-2 text-balance text-xl leading-tight md:text-2xl md:leading-tight">
				Stake, Send, Manage Tokens, and Explore {networkName} – all with ease
			</p>
			<!-- <Button href={`/${data.network}/signup`}>Create your EOS account now</Button> -->
			<!-- <Button disabled>Create your EOS account (Coming Soon)</Button> -->
		</Stack>

		<!-- Network logo -->
		<div
			class="relative left-12 top-8 z-10 col-span-full col-start-3 row-start-1 hidden max-h-80 justify-self-center xs:block sm:col-start-3 md:inset-0 md:col-span-3 md:col-start-7 xl:col-span-4 xl:col-start-6"
		>
			<img class="h-40 object-contain md:h-72" src={networkLogo} alt={networkName} />
		</div>

		<!-- Unicove logo outline -->
		<div
			class="relative col-span-full col-start-1 row-start-1 justify-self-end opacity-30 xs:right-8 xs:col-start-3 xs:place-self-center xs:opacity-100 sm:right-8 sm:col-start-3 md:inset-0 md:col-span-full md:opacity-50"
		>
			<svg
				class="size-48 md:h-full md:w-full"
				viewBox="0 0 632 606"
				width="632"
				height="606"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
			>
				<path
					d="m189.404 242.503-.246-1.635 7.648-27.491a17.921 17.921 0 0 1 4.406-7.683l26.653-27.435a11.284 11.284 0 0 1 14.68-1.328l20.282 14.505 23.48-13.592c17.194-9.954 25.613-30.324 20.522-49.654l-.159.134a69.32 69.32 0 0 1-33.916 15.452l-10.848-15.289c-1.759-2.479-.73-5.964 1.922-7.426 11.164-6.154 19.531-16.585 23.103-29.075l.955-3.34-42.165-30.943a1.426 1.426 0 0 1-.39-1.855c.377-.66 1.204-.9 1.871-.546l41.187 21.89-4.329-30.37 10.326 5.62a37.718 37.718 0 0 0 41.571-3.642l2.486-1.978c2.903 14.355 17.325 23.158 31.274 19.09l5.177-1.51-1.212 9.086c-2.424 18.192 8.395 35.608 25.632 41.477l-6.179 7.933c-10.732 13.778-10.838 33.145-.259 47.042l6.438 8.456-27.303 14.068a93.692 93.692 0 0 1-1.855 3.364l-27.197 47.063m-153.555-.388c-32.413 11.963-71.278 6.89-98.22-15.219L46.984 363.402l269.085 195.614 269.084-195.614-46.219-142.331a20.223 20.223 0 0 0-11.925 4.87c-35.392 30.483-92.775 30.483-128.167 0-7.605-6.549-18.854-6.55-26.458 0-8.698 7.491-18.723 13.141-29.424 16.95m-153.555-.388 2.633 17.506c.351 2.33 2.989 3.497 4.925 2.178l18.631-12.698c1.623-1.106 1.879-3.417.537-4.857l-7.513-8.064.643-4.161m-19.856 10.096c6.979-2.576 13.658-5.941 19.856-10.096m133.699 10.484-.157.272a89.571 89.571 0 0 0-11.813 38.921l-.019-.002c-2.328 20.296 4.616 40.56 18.871 55.071l28.556 29.071.544.589c45.153 53.122 7.744 135.218-61.614 135.218-69.572 0-106.904-82.534-61.319-135.564l5.89-6.852 43.478 50.887c-7.964 10.001-.947 25.058 11.951 25.058 13.067 0 20.114-15.467 11.608-25.475l-3.672-4.319.034-.03-51.365-60.12.103-.12-12.83-15.094c-25.482-29.98-32.043-70.711-19.407-106.25m101.161 18.739c-32.843 11.692-72.049 6.042-98.744-16.95a20.342 20.342 0 0 0-2.417-1.789m0 0c-7.431-4.693-17.208-4.097-24.042 1.789a88.938 88.938 0 0 1-8.496 6.466m32.538-8.255.148-.413-7.302-20.796-22.957 13.745-2.427 15.719M3.25 349.252c-6.146 18.928.587 39.663 16.679 51.361l269.085 195.614c16.091 11.697 37.881 11.697 53.972 0l269.085-195.614c16.092-11.698 22.825-32.433 16.679-51.361L525.968 32.742C519.822 13.816 502.194 1 482.304 1H149.696c-19.89 0-37.518 12.815-43.665 31.743L3.251 349.252Zm356.738-28.066c-6.845-8.258-10.777-18.545-11.241-29.235l20.71-12.807a162.12 162.12 0 0 0 16.442-37.848l2.148-7.407c.772-2.661 4.694-1.888 4.417.871l-.169 1.682c-1.729 17.215 17.263 28.623 31.437 18.883 2.167-1.489 4.672 1.343 2.961 3.347l-5.448 6.379c-10.503 12.298-2.872 31.432 13.146 32.962l.991.094c2.628.251 2.545 4.15-.092 4.285l-1.962.102a180.49 180.49 0 0 1-53.656-5.301l-19.684 23.993ZM187.679 99.901c4.816-4.722 11.841-9.444 18.673-10.141-6.88-.705-13.938-5.468-18.77-10.239-4.825-4.851-9.657-11.98-10.369-18.921-.704 6.877-5.456 13.924-10.207 18.76-4.848 4.843-11.988 9.687-18.932 10.4 6.855.705 13.897 5.443 18.722 10.19 4.848 4.86 9.696 12.004 10.417 18.962.728-6.982 5.593-14.143 10.466-19.01Zm295.102 55.707c-5.509.562-11.175 4.37-15.059 8.179-3.929 3.925-7.852 9.7-8.44 15.331-.581-5.611-4.491-11.373-8.401-15.292-3.89-3.828-9.569-7.65-15.098-8.218 5.6-.575 11.358-4.481 15.268-8.387 3.831-3.9 7.663-9.583 8.231-15.129.574 5.598 4.471 11.347 8.362 15.259 3.897 3.848 9.589 7.689 15.137 8.257Z"
					stroke="#fff"
					stroke-opacity=".4"
					stroke-linejoin="round"
				/>
			</svg>
		</div>
	</section>

	<!-- Carousel -->

	<section class="col-span-full hidden @container">
		<div class="grid min-h-72 rounded-2xl bg-mineShaft-950 px-4 @xl:grid-cols-2 @xl:gap-4">
			<div class="grid place-items-center">
				<svg
					class="col-start-1 row-start-1 h-full w-full object-cover"
					width="635"
					height="296"
					viewBox="0 0 635 296"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
				>
					<path
						d="M201.577-49.292h231.851l115.925 200.789-115.925 200.788H201.577L85.652 151.497 201.577-49.292Z"
						stroke="#fff"
						stroke-opacity=".1"
					/>
					<path
						d="M179.906 13.903 367.864-36.46l137.594 137.594-50.363 187.957-187.957 50.363L129.543 201.86l50.363-187.957Z"
						stroke="#fff"
						stroke-opacity=".5"
					/>
					<path
						d="M179.009 72.29 317.506-7.424l138.497 79.712v159.422l-138.497 79.712-138.497-79.712V72.289Z"
						stroke="#fff"
					/>
				</svg>
				<div
					class="col-start-1 row-start-1 grid max-w-sm grid-cols-3 items-center justify-items-center"
				>
					<img class="h-40" src={Metamask} alt="metamask" />
					<svg width="36" height="36" fill="none" xmlns="http://www.w3.org/2000/svg">
						<path d="M18.008 0v36M36.008 18h-36" stroke="#fff" />
					</svg>
					<img
						class="h-40 rounded-full bg-mineShaft-950 object-contain px-2 py-4"
						src={networkLogo}
						alt={networkName}
					/>
				</div>
			</div>

			<Box class="grid place-items-center py-8">
				{@render textblock({
					title: `Metamask is now ${networkName} compatible`,
					text: 'TODO: The APR is an estimate, and may fluctuate based on how many and much others are staking. Your 21 day lockup period starts when you unstake your EOS. You will always get back your staked EOS.',
					button: {
						text: 'Get a free account',
						href: `/${data.network}/signup`
					}
				})}
			</Box>
		</div>
	</section>

	<Switcher threshold="60ch" class="col-span-full gap-6 ">
		<div>
			{@render textblock({
				title: 'Unicove 2.0 enters early access',
				text: 'Welcome to the new Unicove! We invite you to explore the new features and provide feedback to help us improve this evolving platform. Read the following blog post to learn more.',
				button: {
					text: 'More information',
					href: `https://greymass.medium.com/unicove-2-0-early-access-6a6a318e14db`
				}
			})}
		</div>
		<div>
			{@render textblock({
				title: 'Looking for the old version?',
				text: 'The original version of Unicove has moved to a new URL. If you prefer the old version or need a feature it offers, you can continue to access it at the link below.',
				button: {
					text: 'Go to Unicove 1.0',
					href: `https://v1.unicove.com`
				}
			})}
		</div>
	</Switcher>

	<section class="col-span-full grid hidden grid-cols-subgrid gap-8">
		<!-- Text -->
		<div
			class="z-20 col-span-full row-start-1 max-w-md place-self-center justify-self-start text-balance xs:col-span-1 sm:col-span-full sm:justify-self-auto md:row-span-2 md:row-start-1 md:max-w-md lg:col-span-4 lg:row-auto lg:content-center"
		>
			{@render textblock({
				title: `Stake your tokens for ${APR}% APR`,
				text: 'TODO: The APR is an estimate, and may fluctuate based on how many and much others are staking. Your 21 day lockup period starts when you unstake your EOS. You will always get back your staked EOS.',
				button: {
					text: 'My Staking',
					href: `/${data.network}/staking`
				}
			})}
		</div>

		<!-- Graphics -->
		<div
			class="col-span-full grid place-items-center xs:col-start-3 xs:row-start-1 md:col-start-5 md:row-span-2 md:row-start-2 lg:row-auto"
		>
			<TLVHex {TLV} {APR} />
		</div>
	</section>

	<!-- Charts -->
	<section class="col-span-full hidden">
		<Switcher>
			<div>
				{#if ramPrices.length}
					<RamPriceHistory data={ramPrices} />
				{/if}
			</div>
			<div>
				{#if tokenPrices.length}
					<EOSPriceHistory data={tokenPrices} />
				{/if}
			</div>
		</Switcher>
		<Switcher>
			<div>
				{@render textblock({
					title: `RAM Market`,
					text: 'TODO: The APR is an estimate, and may fluctuate based on how many and much others are staking. Your 21 day lockup period starts when you unstake your EOS. You will always get back your staked EOS.',
					button: {
						text: 'Live network overview',
						href: `#`
					}
				})}
			</div>
			<div>
				{@render textblock({
					title: `EOS Token`,
					text: 'TODO: The APR is an estimate, and may fluctuate based on how many and much others are staking. Your 21 day lockup period starts when you unstake your EOS. You will always get back your staked EOS.',
					button: {
						text: 'Live network overview',
						href: `#`
					}
				})}
			</div>
		</Switcher>
	</section>

	<!-- Performance grid -->
	<section class="col-span-full grid hidden hidden grid-cols-subgrid gap-8">
		<!-- Text -->
		<div class=" col-span-full grid items-center text-balance lg:col-span-3 lg:row-start-1">
			{@render textblock({
				title: `EOS performance and stats`,
				text: 'TODO: The APR is an estimate, and may fluctuate based on how many and much others are staking. Your 21 day lockup period starts when you unstake your EOS. You will always get back your staked EOS.',
				button: {
					text: 'Live network overview',
					href: `#`
				}
			})}
		</div>

		{#snippet gridItem({ title, value }: { title: string; value: string })}
			<div class="grid content-between gap-2">
				<h3 class="text-base text-white/60">{title}</h3>
				<p class="justify-self-end text-xl text-white">{value}</p>
			</div>
		{/snippet}

		<!-- Grid -->
		<div
			class="col-span-full grid grid-cols-2 gap-4 sm:grid-cols-5 lg:col-start-4 xl:col-span-5 xl:col-start-5"
		>
			<Card class="col-span-1 sm:col-span-2">
				<!-- {@render gridItem({ title: 'Total locked value', value: `${TLV} EOS` })} -->
				<div></div>
			</Card>
			<Card class="col-span-1 sm:col-span-2 sm:row-span-2">
				{@render gridItem({ title: 'Daily active users', value: `${DAU}` })}
			</Card>
			<Card class="col-span-1 row-span-2 sm:col-span-1">
				<!-- {@render gridItem({ title: 'Total locked value', value: `${TLV} EOS` })} -->
				<div></div>
			</Card>
			<Card class="col-span-1 row-span-2 sm:col-span-2">
				{@render gridItem({ title: 'RAM Pool', value: `${RAM_POOL} EOS` })}
			</Card>
			<Card class="col-span-1 sm:col-span-3">
				{@render gridItem({ title: 'EOS Market Cap USD', value: `$${EOS_MARKET_CAP}` })}
			</Card>
			<Card class="col-span-1 sm:col-span-3">
				{@render gridItem({ title: 'Current TPS', value: `${TPS}` })}
			</Card>
			<Card class="col-span-1 sm:col-span-2">
				{@render gridItem({ title: 'Total locked value', value: `${TLV} EOS` })}
			</Card>
		</div>
	</section>
</Subgrid>

<style>
	:root {
		--bg-menu: var(--network-theme, #00b5ff60);
	}
</style>
