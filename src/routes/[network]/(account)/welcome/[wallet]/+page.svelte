<script lang="ts">
	import { getContext } from 'svelte';
	import { page } from '$app/stores';
	import Pageheader from '$lib/components/pageheader.svelte';
	import Stack from '$lib/components/layout/stack.svelte';
	import Button from '$lib/components/button/button.svelte';
	import type { UnicoveContext } from '$lib/state/client.svelte';

	const context = getContext<UnicoveContext>('state');

	const walletInfo = {
		anchor: { name: 'Anchor', wharfPluginId: 'anchor' },
		metamask: { name: 'MetaMask', wharfPluginId: 'wallet-plugin-metamask' },
		tokenpocket: { name: 'TokenPocket', wharfPluginId: 'wallet-plugin-tokenpocket' },
		wombat: { name: 'Wombat', wharfPluginId: 'wombat' }
	};

	const wallet = $page.params.wallet as keyof typeof walletInfo;

	const currentWallet = walletInfo[wallet] || walletInfo.anchor;

	function loginWithWallet() {
		context.wharf.login({ walletPlugin: currentWallet.wharfPluginId });
	}

	console.log({ context });

	let isLoggedIn = $derived(!!context.account);
</script>

<Stack>
	<Pageheader title={`Welcome to ${currentWallet.name}`} subtitle="Your account is ready to use" />

	<div class="container mx-auto p-4">
		<p class="mb-6">
			Congratulations! Your {currentWallet.name} account is now set up and ready to go. You're all set
			to start exploring the world of blockchain and decentralized applications.
		</p>

		{#if !isLoggedIn}
			<p class="mb-6">
				To get started, simply log in to your {currentWallet.name} account using the button below.
			</p>

			<Button onclick={loginWithWallet}>Log In with {currentWallet.name}</Button>
		{:else}
			<h2 class="mb-4 text-xl font-semibold">What's Next?</h2>
			<ul class="mb-6 list-disc space-y-2 pl-5">
				<li>Manage your digital assets</li>
				<li>Interact with decentralized applications (dApps)</li>
				<li>etc...</li>
			</ul>
		{/if}
	</div>
</Stack>
