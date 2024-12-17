<script lang="ts">
	import { Box, Card, Stack, Subgrid, Switcher } from '$lib/components/layout';
	import Button from '$lib/components/button/button.svelte';
	import { chainLogos } from '@wharfkit/common';
	import Metamask from '$lib/assets/metamask.svg';
	import EOSPriceHistory from '$lib/components/chart/eospricehistory.svelte';
	import RamPriceHistory from '$lib/components/chart/rampricehistory.svelte';
	import AssetText from '$lib/components/elements/asset.svelte';
	import StakedHEX from './components/stakedhex.svelte';
	import Hero from './components/hero.svelte';
	import { getContext, onMount, type Snippet } from 'svelte';
	import { Asset } from '@wharfkit/antelope';
	import type { HistoricalPrice } from '$lib/types';
	import { getAPR } from '$lib/utils/staking';
	import type { UnicoveContext } from '$lib/state/client.svelte';
	import { calculateValue } from '$lib/utils';

	const { data } = $props();
	const context = getContext<UnicoveContext>('state');

	const apr = $derived(getAPR(data.network));
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

	let ramPrices: HistoricalPrice[] = $state([]);
	let tokenPrices: HistoricalPrice[] = $state([]);

	let networkLogo = $derived(String(chainLogos.get(data.network?.chain.id.toString())));
	let networkName = $derived(String(data.network.chain.name));

	async function loadPrices() {
		const ramResponse: Response = await fetch(`/${data.network}/api/metrics/marketprice/ram`);
		const parsedRamResponse: { date: string; value: number }[] | { error: string } =
			await ramResponse.json();
		if ('error' in parsedRamResponse && parsedRamResponse.error) {
			throw new Error(String(parsedRamResponse.error));
		} else if (Array.isArray(parsedRamResponse)) {
			ramPrices = parsedRamResponse.map((price: { date: string; value: number }) => ({
				date: new Date(price.date),
				value: Asset.from(
					price.value / 10000,
					data.network.chain.systemToken?.symbol || '0,UNKNOWN'
				)
			}));
		}
		const tokenResponse: Response = await fetch(`/${data.network}/api/metrics/marketprice/token`);
		const parsedTokenResponse: { date: string; value: number }[] | { error: string } =
			await tokenResponse.json();
		if ('error' in parsedTokenResponse && parsedTokenResponse.error) {
			throw new Error(String(parsedTokenResponse.error));
		} else if (Array.isArray(parsedTokenResponse)) {
			tokenPrices = parsedTokenResponse.map((price: { date: string; value: number }) => ({
				date: new Date(price.date),
				value: Asset.from(price.value / 10000, '4,USD')
			}));
		}
	}

	onMount(() => {
		loadPrices();
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

<Subgrid id="homepage" class="mb-4 content-start items-start gap-y-20 md:pt-0">
	<Hero {networkLogo} {networkName} />

	<section class="col-span-full @container" class:hidden={!context.settings.data.debugMode}>
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
					title: `The EOS Wallet for MetaMask`,
					text: `MetaMask, an the industry leading self-custody wallet, is now compatible with Unicove and the ${networkName} network. Install the ${networkName} Wallet snap for MetaMask to get started.`,
					button: {
						text: 'Install EOS Wallet for MetaMask',
						href: `/${data.network}/metamask`
					}
				})}
			</Box>
		</div>
	</section>

	<section
		class="col-span-full grid grid-cols-subgrid gap-8"
		class:hidden={!context.settings.data.debugMode}
	>
		<!-- Text -->
		<div
			class="z-20 col-span-full row-start-1 max-w-md place-self-center justify-self-start text-balance xs:col-span-1 sm:col-span-full sm:justify-self-auto md:row-span-2 md:row-start-1 md:max-w-md lg:col-span-4 lg:row-auto lg:content-center"
		>
			<Stack class="max-w-md items-start pl-8">
				<h3 class="h3 leading-tight">EOS Staking Rewards</h3>
				<p>
					Stake {data.network.chain.systemToken?.symbol.name} today for an estimated {apr}% APR<sup
						>1</sup
					>.
				</p>
				<p>
					The {data.network.chain.name} staking rewards program proportionally distributes 85.6k {data
						.network.chain.systemToken?.symbol.name} daily to token holders who have staked their tokens.
					These tokens can be unstaked and will be usable against after a 21 day lockup period.
				</p>
				<div class="flex gap-2">
					<Button class="mt-1" href={`/${data.network}/staking`}>Stake Tokens</Button>
					<Button class="mt-1" variant="secondary" href="#">Learn more</Button>
				</div>
				<p class="text-muted text-xs">
					<sup>1</sup> APR is based on the total amount staked and dynamically changes over time.
				</p>
			</Stack>
		</div>

		<!-- Graphics -->
		<div
			class="col-span-full grid place-items-center xs:col-start-3 xs:row-start-1 md:col-start-5 md:row-span-2 md:row-start-2 lg:row-auto"
		>
			{#if data.network.rexstate}
				<StakedHEX staked={data.network.rexstate.total_lendable} {apr} />
			{/if}
		</div>
	</section>

	<!-- Charts -->
	<section class="col-span-full" class:hidden={!context.settings.data.debugMode}>
		<Switcher>
			<div>
				{#if tokenPrices.length}
					<EOSPriceHistory data={tokenPrices} />
				{/if}
			</div>
			<div>
				{#if ramPrices.length}
					<RamPriceHistory data={ramPrices} />
				{/if}
			</div>
		</Switcher>
		<Switcher>
			<div>
				{@render textblock({
					title: `EOS: The Native Token`,
					text: `The ${data.network.chain.name} network's native token, EOS, can be used for staking rewards, to buy and sell RAM, to pay transaction fees, and more. It is traded on most major exchanges.`,
					button: {
						text: 'Get Tokens',
						href: `${data.network}/fund`
					}
				})}
			</div>
			<div>
				{@render textblock({
					title: `RAM: Tokenized Blockchain Storage`,
					text: `Each unit of RAM ownership represents a portion of the network's total blockchain storage. RAM can be bought and sold directly from the network using the RAM Market.`,
					button: {
						text: 'EOS/RAM Market',
						href: `${data.network}/ram`
					}
				})}
			</div>
		</Switcher>
	</section>

	<!-- Performance grid -->
	<section
		class:hidden={!context.settings.data.debugMode}
		class="col-span-full grid grid-cols-subgrid gap-8"
	>
		<!-- Text -->
		<div class=" col-span-full grid items-center text-balance lg:col-span-3 lg:row-start-1">
			{@render textblock({
				title: `EOS Network DeFi`,
				text: 'System-level DeFi is offered by the EOS network both staking and RAM trading. The network also supports a variety of DeFi applications, including decentralized exchanges, lending platforms, swaps, and more.'
				// button: {
				// 	text: 'Explore DeFi Platforms',
				// 	href: `${data.network}/defi`
				// }
			})}
		</div>

		<!-- Grid -->
		<div
			class="col-span-full grid grid-cols-2 gap-4 sm:grid-cols-5 lg:col-start-4 xl:col-span-5 xl:col-start-5"
		>
			<Card class="col-span-1 sm:col-span-2">
				<div class="grid content-between gap-2">
					<h3 class="text-base text-white/60">
						{data.network.chain.systemToken?.symbol.name}/{data.network.tokenprice?.symbol.name}
					</h3>
					<p class="justify-self-end text-xl text-white">
						<AssetText value={data.network.tokenprice} variant="full" />
					</p>
				</div>
			</Card>
			<Card class="col-span-1 sm:col-span-2 sm:row-span-2">
				<div class="grid content-between gap-2">
					<h3 class="text-base text-white/60">Native TVL</h3>
					<p class="justify-self-end text-xl text-white">
						<AssetText value={tvl} variant="short" />
					</p>
				</div>
			</Card>
			<Card class="col-span-1 row-span-2 sm:col-span-1">
				<img
					class="rounded-full bg-mineShaft-950 object-contain px-2 py-4"
					src={networkLogo}
					alt={networkName}
				/>
			</Card>
			<Card class="col-span-1 row-span-2 sm:col-span-2">
				<div class="grid content-between gap-2">
					<h3 class="text-base text-white/60">RAM/EOS</h3>
					<p class="justify-self-end text-xl text-white">
						<AssetText value={data.network.ramprice?.eos} variant="full" />
					</p>
				</div>
			</Card>
			<Card class="col-span-1 sm:col-span-3">
				<div class="grid content-between gap-2">
					<h3 class="text-base text-white/60">???</h3>
				</div>
			</Card>
			<Card class="col-span-1 sm:col-span-3">
				<div class="grid content-between gap-2">
					<h3 class="text-base text-white/60">EOS Market Cap</h3>
					<p class="justify-self-end text-xl text-white">
						<AssetText value={data.network.marketcap} variant="short" />
					</p>
				</div>
			</Card>
			<Card class="col-span-1 sm:col-span-2">
				<div class="grid content-between gap-2">
					<h3 class="text-base text-white/60">RAM/USD</h3>
					<p class="justify-self-end text-xl text-white">
						<AssetText value={data.network.ramprice?.usd} variant="full" />
					</p>
				</div>
			</Card>
		</div>
	</section>
</Subgrid>
