<script lang="ts">
	import { getContext } from 'svelte';
	import { goto } from '$app/navigation';
	import type { UnicoveContext } from '$lib/state/client.svelte';
	import type { LoginOptions } from '@wharfkit/session';
	import { Button } from 'unicove-components';

	const context = getContext<UnicoveContext>('state');
	const urlPath = $derived(context.urlPath);

	let webAuthenticatorAvailable = $state(false);
	const TARGET_PLUGIN_ID = 'web-authenticator';

	function checkAvailability() {
		const sessionKit = context.wharf.sessionKit;
		if (!sessionKit) {
			webAuthenticatorAvailable = false;
			return false;
		}

		const walletPlugins = sessionKit.walletPlugins;
		const summary = walletPlugins.map((w) => ({
			id: w.id,
			name: w.metadata.name,
			description: w.metadata.description
		}));

		const hasWebAuth = walletPlugins.some((wallet) => wallet.id === TARGET_PLUGIN_ID);
		webAuthenticatorAvailable = hasWebAuth;
		return hasWebAuth;
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

{#if webAuthenticatorAvailable}
	<Button variant="primary" class="w-fit" onclick={handleGetStarted}
		>Get Started - Create Account</Button
	>
{/if}
