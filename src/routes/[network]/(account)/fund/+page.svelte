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
	import Center from '$lib/components/layout/center.svelte';

	const ON_RAMP_SERVICES = [
		{
			id: 'coinbase',
			logo: '/coinbase-icon.svg',
			fees: {
				range: '1.49% - 3.99%'
			},
			limits: {
				daily: '$25,000/day'
			},
			details: ['United States Only', 'Instant ACH transfers', 'Debit card support', 'Bank wire'],
			action: {
				text: m.buy_eos_with_coinbase(),
				handler: 'coinbase',
				className: 'bg-blue-600 hover:bg-blue-500'
			}
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
		}
	}

	function handleOnRamp(service: (typeof ON_RAMP_SERVICES)[number]['id']) {
		if (service === 'coinbase') {
			return handleCoinbaseOnRamp();
		}
		throw new Error(`${service} on-ramp has not been implemented`);
	}
</script>

<h3 class="mb-4 text-lg font-semibold">{m.select_provider()}</h3>

{#if !context.account}
	<p class="text-gray-300 mb-4 text-center text-sm">
		{m.must_be_logged_in_for_feature()}
	</p>
{:else}
	<MultiCard class="@container">
		{#each ON_RAMP_SERVICES as service}
			<Card class="@md:w-1/2">
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
					<ul class="list-disc pl-6 text-sm text-white">
						{#each service.details as detail}
							<li>{detail}</li>
						{/each}
					</ul>
				</div>
				<div class="mt-6">
					{#if service.id === 'coinbase' && coinbaseInstance}
						<Button
							variant="secondary"
							class="{service.action.className} w-full"
							onclick={() => handleOnRamp(service.id)}>{service.action.text}</Button
						>
					{:else}
						<p class="text-gray-300 text-sm">{m.no_supported_funding_methods()}</p>
					{/if}
				</div>
			</Card>
		{/each}
	</MultiCard>
{/if}

<!-- Exchanges section remains unchanged -->
<h2 class="h2">Exchanges</h2>
<p>
	EOS can be purchased through a number of platforms, depending on the users needs and location.
	Below are some of the most popular options available.
</p>
<ul>
	<li><a href="https://www.binance.com">https://www.binance.com</a></li>
	<li><a href="https://www.coinbase.com">https://www.coinbase.com</a></li>
	<li><a href="https://www.kraken.com">https://www.kraken.com</a></li>
	<li><a href="https://www.okx.com">https://www.okx.com</a></li>
	<li><a href="https://global-aws.huobi.com">https://global-aws.huobi.com</a></li>
	<li><a href="https://www.gate.io">https://www.gate.io</a></li>
	<li><a href="https://upbit.com">https://upbit.com</a></li>
	<li><a href="https://kucoin.com">https://kucoin.com</a></li>
</ul>

{#if context.settings.data.debugMode}
	<h3 class="h3">{m.common_debugging()}</h3>
	<Code>
		{JSON.stringify(options, null, 2)}
	</Code>
	<Code>
		{JSON.stringify(coinbaseInstance, null, 2)}
	</Code>
{/if}
