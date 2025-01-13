<script lang="ts">
	import Card from '$lib/components/layout/box/card.svelte';
	import type { NetworkState } from '$lib/state/network.svelte';
	import { Asset } from '@wharfkit/antelope';
	import AssetText from '$lib/components/elements/asset.svelte';
	import { calculateValue } from '$lib/utils';
	import TextBlock from './text-block.svelte';
	import Box from '$lib/components/layout/box/box.svelte';
	import * as m from '$lib/paraglide/messages';

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

<section class="col-span-full grid grid-cols-subgrid gap-4">
	<!-- Text -->
	<div
		class="col-span-full row-start-2 grid items-center text-balance lg:col-span-3 lg:row-start-1"
	>
		<Box>
			<TextBlock
				title={m.homepage_performance_defi({
					network: networkName
				})}
				text={m.homepage_performance_defi_description({
					network: networkName
				})}
			/>
		</Box>
	</div>

	<!-- Grid -->
	<div
		class="col-span-full grid content-start gap-4 @container lg:col-start-4 xl:col-span-5 xl:col-start-5"
	>
		<div id="performance-row-1" class="grid gap-4 @lg:grid-cols-[1fr_auto_1fr]">
			<!-- Market Cap -->
			<Card class="grid content-between gap-4  bg-mineShaft-900/40">
				<h3 class="text-muted text-sm">{network.chain.name} {m.common_market_cap()}</h3>
				<p class="justify-self-end text-nowrap text-xl font-semibold text-white">
					<AssetText value={network.marketcap} variant="short" />
				</p>
			</Card>

			<!-- Network logo -->
			<!-- contain:size lets us keep the auto grid height while preventing the content from setting the height -->
			<Card
				class="order-first flex justify-center @lg:order-none @lg:aspect-square @lg:[contain:size]"
			>
				<img
					class="max-h-24 object-contain"
					src={networkLogo}
					alt={networkName}
					loading="lazy"
					width="200"
					height="200"
				/>
			</Card>

			<!-- Native TVL -->
			<Card class="grid content-between gap-4 bg-mineShaft-900/60">
				<h3 class="text-muted text-sm">{m.common_native_tvl()}</h3>
				<p class="justify-self-end text-nowrap text-xl font-semibold text-white">
					<AssetText value={tvl} variant="short" />
				</p>
			</Card>
		</div>

		<div id="performance-row-2" class="grid gap-4 @lg:grid-cols-3">
			<!-- Token price -->
			<Card class="grid flex-1 content-between gap-4 @sm:shrink">
				<h3 class="text-muted text-sm">
					{network.chain.systemToken?.symbol.name}/{network.tokenprice?.symbol.name}
				</h3>
				<p class="justify-self-end text-nowrap text-xl font-semibold text-white">
					<AssetText value={network.tokenprice} variant="full" />
				</p>
			</Card>

			<!-- Ram Eos pair -->
			<Card class="grid flex-1 content-between gap-4  bg-mineShaft-900/60">
				<h3 class="text-muted text-sm">RAM/{network.chain.systemToken?.symbol.name}</h3>
				<p class="justify-self-end text-nowrap text-xl font-semibold text-white">
					<AssetText value={network.ramprice?.eos} variant="full" />
				</p>
			</Card>

			<!-- Ram price -->
			<Card class="grid flex-1 content-between gap-4 bg-mineShaft-900/40">
				<h3 class="text-muted text-sm">RAM/USD</h3>
				<p class="justify-self-end text-nowrap text-xl font-semibold text-white">
					<AssetText value={network.ramprice?.usd} variant="full" />
				</p>
			</Card>
		</div>
	</div>
</section>
