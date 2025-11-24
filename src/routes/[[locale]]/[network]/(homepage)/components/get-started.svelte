<script lang="ts">
	import { getContext } from 'svelte';
	import { goto } from '$app/navigation';
	import type { UnicoveContext } from '$lib/state/client.svelte';
	import type { LoginOptions } from '@wharfkit/session';
	import { Button } from 'unicove-components';

	const context = getContext<UnicoveContext>('state');
	const urlPath = $derived(context.urlPath);

	let pluginAvailable = $state(true);
	const TARGET_PLUGIN_ID = 'web-authenticator';

	function checkAvailability() {
		const sessionKit = context.wharf.sessionKit;
		if (!sessionKit) {
			return false;
		}

		const walletPlugins = sessionKit.walletPlugins;
		const hasPlugin = walletPlugins.some((wallet) => wallet.id === TARGET_PLUGIN_ID);
		pluginAvailable = hasPlugin;
		return hasPlugin;
	}

	$effect(() => {
		if (checkAvailability()) {
			return;
		}

		const interval = setInterval(() => {
			if (checkAvailability()) {
				clearInterval(interval);
			}
		}, 250);

		return () => {
			clearInterval(interval);
		};
	});

	async function handleGetStarted() {
		if (!context.wharf.sessionKit) {
			return;
		}

		const webAuthenticatorPlugin = context.wharf.sessionKit.walletPlugins.find(
			(wallet) => wallet.id === TARGET_PLUGIN_ID
		);

		if (!webAuthenticatorPlugin) {
			console.error('Web Authenticator plugin not found');
			return;
		}

		const options: LoginOptions = {
			walletPlugin: webAuthenticatorPlugin.id,
			chain: context.network.chain.id
		};

		try {
			const session = await context.wharf.login(options);
			goto(urlPath(`/account/${session.actor}`));
		} catch (error) {
			console.error('Failed to login with web authenticator:', error);
		}
	}
</script>

{#if pluginAvailable}
	<Button variant="primary" class="w-fit" onclick={handleGetStarted}
		>Get Started - Create Account</Button
	>
{/if}
