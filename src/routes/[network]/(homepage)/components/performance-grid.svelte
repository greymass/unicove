<script lang="ts">
	import Card from '$lib/components/layout/box/card.svelte';
	import type { NetworkState } from '$lib/state/network.svelte';
	import { Asset } from '@wharfkit/antelope';
	import AssetText from '$lib/components/elements/asset.svelte';
	import { calculateValue } from '$lib/utils';
	import TextBlock from './text-block.svelte';
	import Box from '$lib/components/layout/box/box.svelte';

	interface Props {
		network: NetworkState;
		networkName: string;
		networkLogo: string;
	}

	let { network, networkLogo, networkName }: Props = $props();
	const tvl = $derived.by(() => {
		const token = Asset.fromUnits(0, network.chain.systemToken!.symbol);
		if (network.supports('rex') && network.rexstate) {
			token.units.add(network.rexstate.total_lendable.units);
		}
		if (network.supports('rammarket') && network.ramstate) {
			token.units.add(network.ramstate.quote.balance.units);
		}
		if (network.tokenprice) {
			return calculateValue(token, network.tokenprice);
		}
		return token;
	});
</script>

<section class="col-span-full grid grid-cols-subgrid gap-8">
	<!-- Text -->
	<div
		class="col-span-full row-start-2 grid items-center text-balance lg:col-span-3 lg:row-start-1"
	>
		<Box>
			<TextBlock
				{...{
					title: `EOS Network DeFi`,
					text: 'System-level DeFi is offered by the EOS network both staking and RAM trading. The network also supports a variety of DeFi applications, including decentralized exchanges, lending platforms, swaps, and more.'
					// button: {
					// 	text: 'Explore DeFi Platforms',
					// 	href: `${network}/defi`
					// }
				}}
			/>
		</Box>
	</div>

	<!-- Grid -->
	<div
		class="col-span-full grid grid-cols-2 gap-4 sm:grid-cols-5 lg:col-start-4 xl:col-span-5 xl:col-start-5"
	>
		<Card class="col-span-1 sm:col-span-2">
			<div class="grid content-between gap-2">
				<h3 class="text-base text-white/60">
					{network.chain.systemToken?.symbol.name}/{network.tokenprice?.symbol.name}
				</h3>
				<p class="justify-self-end text-xl text-white">
					<AssetText value={network.tokenprice} variant="full" />
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
					<AssetText value={network.ramprice?.eos} variant="full" />
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
					<AssetText value={network.marketcap} variant="short" />
				</p>
			</div>
		</Card>
		<Card class="col-span-1 sm:col-span-2">
			<div class="grid content-between gap-2">
				<h3 class="text-base text-white/60">RAM/USD</h3>
				<p class="justify-self-end text-xl text-white">
					<AssetText value={network.ramprice?.usd} variant="full" />
				</p>
			</div>
		</Card>
	</div>
</section>
