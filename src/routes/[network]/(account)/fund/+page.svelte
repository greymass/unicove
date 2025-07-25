<script lang="ts">
	import { getContext } from 'svelte';
	import { Card } from 'unicove-components';
	import binanceLogo from '$lib/assets/exchanges/binance.webp?enhanced';
	import coinbaseIconLogo from '$lib/assets/exchanges/coinbase-icon.webp?enhanced';
	import krakenLogo from '$lib/assets/exchanges/kraken.webp?enhanced';
	import okxLogo from '$lib/assets/exchanges/okx.webp?enhanced';
	import huobiLogo from '$lib/assets/exchanges/huobi.webp?enhanced';
	import gateioLogo from '$lib/assets/exchanges/gate-io.webp?enhanced';
	import upbitLogo from '$lib/assets/exchanges/upbit.webp?enhanced';
	import kucoinLogo from '$lib/assets/exchanges/kucoin.webp?enhanced';
	import type { UnicoveContext } from '$lib/state/client.svelte';
	import { Button } from 'unicove-components';
	import * as m from '$lib/paraglide/messages';
	import { DL, DLRow, DD } from 'unicove-components';
	import coinbaseLogo from '$lib/assets/exchanges/coinbase.svg';
	import { Stack } from 'unicove-components';
	import { Cluster } from 'unicove-components';
	import { CoinbaseOnRamp } from './onramps/coinbase.svelte';

	const context = getContext<UnicoveContext>('state');

	const coinbaseOnRamp = new CoinbaseOnRamp(context);

	const ON_RAMP_PROVIDERS = [
		{
			id: 'coinbase',
			logo: coinbaseLogo,
			isLoading: coinbaseOnRamp.isLoading,
			action: {
				text: m.buy_token_with_coinbase({
					token: context.network.token.symbol.name
				}),
				handler: () => coinbaseOnRamp.open()
			}
		}
	] as const;

	const EXCHANGES = [
		{
			name: 'Binance',
			logo: binanceLogo,
			url: 'https://www.binance.com'
		},
		{
			name: 'Coinbase',
			logo: coinbaseIconLogo,
			url: 'https://www.coinbase.com'
		},
		{
			name: 'Kraken',
			logo: krakenLogo,
			url: 'https://www.kraken.com'
		},
		{
			name: 'OKX',
			logo: okxLogo,
			url: 'https://www.okx.com'
		},
		{
			name: 'Huobi Global',
			logo: huobiLogo,
			url: 'https://global-aws.huobi.com'
		},
		{
			name: 'Gate.io',
			logo: gateioLogo,
			url: 'https://www.gate.io'
		},
		{
			name: 'Upbit',
			logo: upbitLogo,
			url: 'https://upbit.com'
		},
		{
			name: 'Kucoin',
			logo: kucoinLogo,
			url: 'https://kucoin.com'
		}
	] as const;
</script>

<Stack class="mt-6 gap-12">
	<Stack class="gap-4">
		<h2 class="text-headline leading-4">{m.fund_direct_purchase()}</h2>
		<p>
			{m.fund_direct_purchase_description({
				token: context.network.token.symbol.name
			})}
		</p>
		<Cluster tag="ul">
			{#each ON_RAMP_PROVIDERS as provider}
				<Card tag="li" class="max-w-sm p-6">
					<div>
						<div class="mb-4 flex items-center justify-center">
							<img src={provider.logo} alt={provider.id} class="h-24 w-3/5 object-contain" />
						</div>
						<DL>
							{#if context.network.config.coinbase}
								<DLRow title={m.fund_token_to_purchase()}>
									<DD>{context.network.config.coinbase.assets.join(', ')}</DD>
								</DLRow>
							{/if}
							<DLRow title={m.send_receiving_account()}>
								<DD>
									{#if context.account}
										{context.account?.name}
									{:else}
										{m.common_not_logged_in()}
									{/if}
								</DD>
							</DLRow>
						</DL>
					</div>

					<div class="mt-6">
						{#if !context.account}
							<p class="text-sm">{m.common_must_be_logged_in()}</p>
						{:else}
							<Button
								class="w-full"
								disabled={provider.isLoading}
								onclick={provider.action.handler}
							>
								{#if provider.isLoading}
									{m.common_loading()}
								{:else}
									{provider.action.text}
								{/if}</Button
							>
						{/if}
					</div>
				</Card>
			{/each}
		</Cluster>
	</Stack>

	<Stack class="gap-4">
		<h2 class="text-headline leading-4">{m.common_exchanges()}</h2>

		<p>
			{m.fund_exchange_description({
				token: context.network.token.symbol.name
			})}
		</p>

		<ul class="layout-grid" style="--grid-itemWidth:10rem;">
			{#each EXCHANGES as exchange}
				<Card tag="li" class="">
					<a
						href={exchange.url}
						target="_blank"
						rel="noopener noreferrer"
						class="block h-full transition-all hover:scale-105"
					>
						<div class="bg-surface-container-high mb-4 grid aspect-square rounded-lg p-4">
							<enhanced:img
								src={exchange.logo}
								alt="{exchange.name} logo"
								class="h-full object-cover"
							/>
						</div>
						<h3 class="text-center text-lg font-medium">{exchange.name}</h3>
					</a>
				</Card>
			{/each}
		</ul>
	</Stack>
</Stack>
