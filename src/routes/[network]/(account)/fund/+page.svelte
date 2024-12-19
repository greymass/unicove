<script lang="ts">
	import { getContext } from 'svelte';
	import Card from '$lib/components/layout/box/card.svelte';
	import Code from '$lib/components/code.svelte';
	import binanceLogo from '$lib/assets/exchanges/binance.webp?enhanced';
	import coinbaseIconLogo from '$lib/assets/exchanges/coinbase-icon.webp?enhanced';
	import krakenLogo from '$lib/assets/exchanges/kraken.webp?enhanced';
	import okxLogo from '$lib/assets/exchanges/okx.webp?enhanced';
	import huobiLogo from '$lib/assets/exchanges/huobi.webp?enhanced';
	import gateioLogo from '$lib/assets/exchanges/gate-io.webp?enhanced';
	import upbitLogo from '$lib/assets/exchanges/upbit.webp?enhanced';
	import kucoinLogo from '$lib/assets/exchanges/kucoin.webp?enhanced';
	import type { UnicoveContext } from '$lib/state/client.svelte';
	import { initOnRamp, type CBPayInstanceType, type InitOnRampParams } from '@coinbase/cbpay-js';
	import Button from '$lib/components/button/button.svelte';
	import { env } from '$env/dynamic/public';
	import * as m from '$lib/paraglide/messages';
	import Grid from '$lib/components/layout/grid.svelte';
	import { DL, DLRow, DD } from '$lib/components/descriptionlist';
	import coinbaseLogo from '$lib/assets/exchanges/coinbase.svg';
	import Stack from '$lib/components/layout/stack.svelte';
	import Cluster from '$lib/components/layout/cluster.svelte';

	const ON_RAMP_PROVIDERS = [
		{
			id: 'coinbase',
			logo: coinbaseLogo,
			action: {
				text: m.buy_eos_with_coinbase(),
				handler: 'coinbase'
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

	const context = getContext<UnicoveContext>('state');

	const coinbaseOptions: InitOnRampParams | undefined = $derived.by(() => {
		let appId = '';
		let asset = '';
		switch (String(context.network)) {
			case 'eos':
				if (env.PUBLIC_EOS_COINBASE_APPID && env.PUBLIC_EOS_COINBASE_ASSET) {
					appId = env.PUBLIC_EOS_COINBASE_APPID;
					asset = env.PUBLIC_EOS_COINBASE_ASSET;
				}
				break;
			default:
				return;
		}
		return {
			appId,
			widgetParameters: {
				addresses: {
					[String(context.account?.name)]: ['eosio']
				},
				assets: [asset]
			},
			onSuccess: () => {
				console.log('success');
			},
			experienceLoggedIn: 'popup',
			experienceLoggedOut: 'popup',
			closeOnExit: true,
			closeOnSuccess: true
		};
	});

	let coinbaseInstance: CBPayInstanceType | null = $state(null);

	$effect(() => {
		if (coinbaseOptions && context.account?.name) {
			initOnRamp(coinbaseOptions, (error, instance) => {
				if (error) {
					console.error(error);
					return;
				}
				if (instance) {
					coinbaseInstance = instance;
				}
			});
		} else {
			coinbaseInstance = null;
		}
	});

	function handleCoinbaseOnRamp() {
		if (coinbaseInstance) {
			coinbaseInstance.open();
		} else {
			console.error('Coinbase instance not found');
			alert(m.coinbase_service_unavailable());
		}
	}

	function handleOnRamp(service: (typeof ON_RAMP_PROVIDERS)[number]['id']) {
		if (!context.account) {
			return;
		}
		if (service === 'coinbase') {
			return handleCoinbaseOnRamp();
		}
		throw new Error(`${service} on-ramp has not been implemented`);
	}
</script>

<Stack class="gap-12">
	<Stack class="gap-4">
		<h2 class="h4">{m.fund_direct_purchase()}</h2>
		<p>{m.fund_direct_purchase_description()}</p>
		<Cluster tag="ul">
			{#each ON_RAMP_PROVIDERS as service}
				<Card tag="li" class="max-w-sm p-6">
					<div>
						<div class="mb-4 flex items-center justify-center">
							<img src={service.logo} alt={service.id} class="h-24 w-3/5 object-contain" />
						</div>
						<DL>
							<DLRow title={m.fund_token_to_purchase()}>
								<DD>{env.PUBLIC_EOS_COINBASE_ASSET}</DD>
							</DLRow>
							<DLRow title={m.send_receiving_account()}>
								<DD>{context.account?.name}</DD>
							</DLRow>
						</DL>
					</div>

					<div class="mt-6">
						{#if !context.account}
							<p class="text-sm">{m.common_must_be_logged_in()}</p>
						{:else}
							<Button class="w-full" onclick={() => handleOnRamp(service.id)}
								>{service.action.text}</Button
							>
						{/if}
					</div>
				</Card>
			{/each}
		</Cluster>
	</Stack>

	<Stack class="gap-4">
		<h2 class="h4">{m.common_exchanges()}</h2>

		<p>
			{m.fund_exchange_description()}
		</p>

		<Grid tag="ul" itemWidth="10rem" class="">
			{#each EXCHANGES as exchange}
				<Card tag="li" class="">
					<a
						href={exchange.url}
						target="_blank"
						rel="noopener noreferrer"
						class="block h-full transition-all hover:scale-105"
					>
						<div class="mb-4 grid aspect-square rounded-lg bg-mineShaft-900 p-4">
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
		</Grid>
	</Stack>

	{#if context.settings.data.debugMode}
		<h3 class="h3">{m.common_debugging()}</h3>
		<Code>
			{JSON.stringify(coinbaseOptions, null, 2)}
		</Code>
		<Code>
			{JSON.stringify(coinbaseInstance, null, 2)}
		</Code>
	{/if}
</Stack>
