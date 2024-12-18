<script lang="ts">
	import { Card, Stack, Subgrid, Switcher } from '$lib/components/layout';
	import Button from '$lib/components/button/button.svelte';
	import { chainLogos } from '@wharfkit/common';
	import EOSPriceHistory from '$lib/components/chart/eospricehistory.svelte';
	import RamPriceHistory from '$lib/components/chart/rampricehistory.svelte';
	import AssetText from '$lib/components/elements/asset.svelte';
	import Hero from './components/hero.svelte';
	import { getContext, type Snippet } from 'svelte';
	import { Asset } from '@wharfkit/antelope';
	import type { UnicoveContext } from '$lib/state/client.svelte';
	import { calculateValue } from '$lib/utils';
	import Carousel from './components/carousel.svelte';
	import StakingRewards from './components/staking-rewards.svelte';

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

	<Carousel {networkLogo} {networkName} />

	<StakingRewards network={data.network} />

	<!-- Charts -->
	<section class="col-span-full">
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
