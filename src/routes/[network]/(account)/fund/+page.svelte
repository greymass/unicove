<script lang="ts">
	import Card from '$lib/components/layout/box/card.svelte';
	import Code from '$lib/components/code.svelte';
	import type { UnicoveContext } from '$lib/state/client.svelte';
	import { getContext } from 'svelte';
	import { initOnRamp, type CBPayInstanceType, type InitOnRampParams } from '@coinbase/cbpay-js';
	import Button from '$lib/components/button/button.svelte';
	import { env } from '$env/dynamic/public';
	import * as m from '$lib/paraglide/messages';
	import { MultiCard } from '$lib/components/layout';

	const ON_RAMP_PROVIDERS = [
		{
			id: 'coinbase',
			logo: '/coinbase-icon.svg',
			fees: {
				range: '1.49% - 3.99%'
			},
			limits: {
				daily: m._500_per_day()
			},
			details: [m.buy_or_transfer_crypto(), m.debit_and_credit_cards_supported()],
			action: {
				text: m.buy_eos_with_coinbase(),
				handler: 'coinbase',
				className: 'bg-blue-600 hover:bg-blue-500'
			}
		}
	] as const;

	const EXCHANGES = [
		{
			name: 'Binance',
			logo: '/binance.webp',
			url: 'https://www.binance.com'
		},
		{
			name: 'Coinbase',
			logo: '/coinbase.webp',
			url: 'https://www.coinbase.com'
		},
		{
			name: 'Kraken',
			logo: '/kraken.webp',
			url: 'https://www.kraken.com'
		},
		{
			name: 'OKX',
			logo: '/okx.webp',
			url: 'https://www.okx.com'
		},
		{
			name: 'Huobi Global',
			logo: '/huobi.webp',
			url: 'https://global-aws.huobi.com'
		},
		{
			name: 'Gate.io',
			logo: '/gate-io.webp',
			url: 'https://www.gate.io'
		},
		{
			name: 'Upbit',
			logo: '/upbit.webp',
			url: 'https://upbit.com'
		},
		{
			name: 'Kucoin',
			logo: '/kucoin.webp',
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

<h2 class="h4">Token Purchase Providers</h2>

<MultiCard class="max-w-[700px]">
	{#each ON_RAMP_PROVIDERS as service}
		<Card>
			<div>
				<div class="mb-4 flex items-center justify-center">
					<img src={service.logo} alt={service.id} class="h-24 w-3/5 object-contain" />
				</div>
				<div class="grid grid-cols-[1fr_auto] text-sm">
					<div class="flex items-center py-2">
						<p class="text-md">{m.processing_fees()}</p>
						<p class="ml-auto text-white">{service.fees.range}</p>
					</div>
					<div class="border-gray-300 col-span-2 border-t border-t-[0.5px]"></div>
					<div class="flex items-center py-2">
						<p class="text-md">{m.limits()}</p>
						<p class="ml-auto text-white">{service.limits.daily}</p>
					</div>
					<div class="border-gray-300 col-span-2 border-t border-t-[0.5px]"></div>
				</div>
				<p class="text-md my-2">{m.details()}</p>
				<ul class="list-disc pl-6">
					{#each service.details as detail}
						<li class="text-sm text-white">{detail}</li>
					{/each}
				</ul>
			</div>
			<div class="mt-6">
				{#if !context.account}
					<p class="text-gray-300 text-sm">{m.must_be_logged_in_for_feature()}</p>
				{:else}
					<Button
						variant="secondary"
						class="{service.action.className} w-full"
						onclick={() => handleOnRamp(service.id)}>{service.action.text}</Button
					>
				{/if}
			</div>
		</Card>
	{/each}
</MultiCard>

<h2 class="h4">{m.exchanges()}</h2>

<p class="mb-6">
	{m.where_eos_can_be_purchased()}
</p>

<MultiCard class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
	{#each EXCHANGES as exchange}
		<Card class="h-full p-6 pb-2">
			<a
				href={exchange.url}
				target="_blank"
				rel="noopener noreferrer"
				class="block h-full transition-all hover:scale-105"
			>
				<div class="relative mb-4 aspect-square overflow-hidden rounded-lg bg-mineShaft-900 p-4">
					<img
						src={exchange.logo}
						alt="{exchange.name} logo"
						class="absolute left-1/2 top-1/2 h-full w-full -translate-x-1/2 -translate-y-1/2 transform object-cover p-4"
					/>
				</div>
				<h3 class="text-center text-lg font-medium">{exchange.name}</h3>
			</a>
		</Card>
	{/each}
</MultiCard>

{#if context.settings.data.debugMode}
	<h3 class="h3">{m.common_debugging()}</h3>
	<Code>
		{JSON.stringify(coinbaseOptions, null, 2)}
	</Code>
	<Code>
		{JSON.stringify(coinbaseInstance, null, 2)}
	</Code>
{/if}
