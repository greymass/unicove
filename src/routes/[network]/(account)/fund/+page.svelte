<script lang="ts">
	import Code from '$lib/components/code.svelte';
	import type { UnicoveContext } from '$lib/state/client.svelte';
	import { getContext } from 'svelte';
	import { initOnRamp, type CBPayInstanceType, type InitOnRampParams } from '@coinbase/cbpay-js';
	import Button from '$lib/components/button/button.svelte';
	import { env } from '$env/dynamic/public';
	import * as m from '$lib/paraglide/messages';

	const context = getContext<UnicoveContext>('state');

	const options: InitOnRampParams | undefined = $derived.by(() => {
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
				// return undefined for an unsupported network
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
		if (options && context.account?.name) {
			initOnRamp(options, (error, instance) => {
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

	function coinbase() {
		if (coinbaseInstance) {
			coinbaseInstance.open();
		}
	}
</script>

{#if !context.account}
	<p>You must be logged in with an account to use this feature.</p>
{:else if !coinbaseInstance}
	<p>No supported funding methods for this blockchain.</p>
{:else}
	<Button onclick={coinbase}>Buy EOS with Coinbase</Button>
{/if}

{#if context.settings.data.debugMode}
	<h3 class="h3">{m.common_debugging()}</h3>

	<Code>
		{JSON.stringify(options, null, 2)}
	</Code>

	<Code>
		{JSON.stringify(coinbaseInstance, null, 2)}
	</Code>
{/if}
