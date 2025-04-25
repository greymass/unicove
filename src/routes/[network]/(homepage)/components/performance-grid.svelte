<script lang="ts">
	import Card from '$lib/components/layout/box/card.svelte';
	import type { NetworkState } from '$lib/state/network.svelte';
	import AssetText from '$lib/components/elements/asset.svelte';
	import { calculateValue } from '$lib/utils';
	import TextBlock from './text-block.svelte';
	import Box from '$lib/components/layout/box/box.svelte';
	import * as m from '$lib/paraglide/messages';
	import type { MarketContext, UnicoveContext } from '$lib/state/client.svelte';
	import { Asset, Int64 } from '@wharfkit/antelope';
	import { getContext } from 'svelte';
	import { Currencies } from '$lib/types/currencies';
	import type { NetworkValueState } from '$lib/state/value.svelte';

	interface Props {
		network: NetworkState;
		networkName: string;
		networkLogo: string;
	}

	const context = getContext<UnicoveContext>('state');
	const market = getContext<MarketContext>('market');

	function calculateTvl(network: NetworkState, networkValue: NetworkValueState): Asset {
		const token = Asset.fromUnits(0, network.token.symbol);
		if (network.supports('rex') && network.token.distribution) {
			token.units.add(network.token.distribution.staked.units);
		}
		if (network.supports('rammarket')) {
			token.units.add(network.resources.ram.supply);
		}
		if (networkValue.systemtoken.price.units.gt(Int64.from(0))) {
			return calculateValue(token, networkValue.systemtoken.price);
		}
		return token;
	}

	let { network, networkLogo, networkName }: Props = $props();

	const tvl = $derived(calculateTvl(network, market.network));
	const marketcap = $derived(
		network.token.distribution
			? calculateValue(network.token.distribution.circulating, market.network.systemtoken.price)
			: Asset.fromUnits(0, Currencies[context.settings.data.displayCurrency].symbol)
	);
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
		class="@container col-span-full grid content-start gap-4 lg:col-start-4 xl:col-span-5 xl:col-start-5"
	>
		<div id="performance-row-1" class="grid gap-4 @-lg:grid-cols-[1fr_auto_1fr]">
			<!-- Market Cap -->
			<Card class="bg-surface-container-high grid content-between  gap-4">
				<h3 class="text-muted text-sm">{network.token.name} {m.common_market_cap()}</h3>
				<p class="text-on-surface justify-self-end text-xl font-semibold text-nowrap">
					<AssetText value={marketcap} variant="short" />
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
			<Card class="bg-surface-container-highest grid content-between gap-4">
				<h3 class="text-muted text-sm">{m.common_native_tvl()}</h3>
				<p class="text-on-surface justify-self-end text-xl font-semibold text-nowrap">
					<AssetText value={tvl} variant="short" />
				</p>
			</Card>
		</div>

		<div id="performance-row-2" class="grid gap-4 @lg:grid-cols-3">
			<!-- Token price -->
			<Card class="grid flex-1 content-between gap-4 @sm:shrink">
				<h3 class="text-muted text-sm">
					{network.token.symbol.name}/{market.network.systemtoken.price.symbol.name}
				</h3>
				<p class="text-on-surface justify-self-end text-xl font-semibold text-nowrap">
					<AssetText value={market.network.systemtoken.price} variant="full" />
				</p>
			</Card>

			<!-- Ram Eos pair -->
			<Card class="bg-surface-container-highest grid flex-1 content-between  gap-4">
				<h3 class="text-muted text-sm">RAM/{network.token.symbol.name}</h3>
				<p class="text-on-surface justify-self-end text-xl font-semibold text-nowrap">
					<AssetText value={network.resources.ram.price.rammarket} variant="short" />
				</p>
			</Card>

			<!-- Ram price -->
			{#if network.resources && network.resources.ram.price.rammarket}
				<Card class="bg-surface-container-high grid flex-1 content-between gap-4">
					<h3 class="text-muted text-sm">RAM/USD</h3>
					<p class="text-on-surface justify-self-end text-xl font-semibold text-nowrap">
						<AssetText
							value={calculateValue(
								network.resources.ram.price.rammarket,
								market.network.systemtoken.price
							)}
							variant="full"
						/>
					</p>
				</Card>
			{/if}
		</div>
	</div>
</section>
