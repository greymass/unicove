<script lang="ts">
	import { page } from '$app/stores';
	import Button from '$lib/components/button/button.svelte';
	import Pill from '$lib/components/pill/pill.svelte';

	$: network = $page.params.network;
	$: walletType = $page.params.walletType;

	const walletTypes = {
		webAuths: {
			title: 'Sign Up with Web Authenticators',
			description:
				"Web Authenticators are convenient wallet options that don't require any installation.",
			benefits: [
				'No software installation needed',
				'Access your account from any device with a web browser',
				'Secure and easy to use'
			]
		},
		hardWallets: {
			title: 'Sign Up with Hardware Wallets',
			description: 'Hardware wallets are physical devices that securely store your private keys.',
			benefits: [
				'Highest level of security',
				'Offline storage of private keys',
				'Support for multiple cryptocurrencies'
			]
		},
		softWallets: {
			title: 'Sign Up with Software Wallets',
			description:
				'Software wallets are applications you install on your computer or mobile device.',
			benefits: [
				'Easy to use and set up',
				'Convenient for frequent transactions',
				'Often free to download and use'
			]
		},
		extensions: {
			title: 'Sign Up with Browser Extensions',
			description:
				'Browser extension wallets integrate directly with your web browser for easy access.',
			benefits: [
				'Seamless integration with web applications',
				'Quick access from your browser',
				'Easy to use for web3 interactions'
			]
		}
	};

	$: currentWalletInfo = walletTypes[walletType as keyof typeof walletTypes];
</script>

<div class="container mx-auto p-4">
	<h1 class="mb-4 text-2xl font-bold">{currentWalletInfo.title}</h1>
	<p class="mb-4">{currentWalletInfo.description}</p>

	<h2 class="mb-2 text-xl font-semibold">Benefits:</h2>
	<ul class="mb-6 list-disc pl-5">
		{#each currentWalletInfo.benefits as benefit}
			<li>{benefit}</li>
		{/each}
	</ul>

	<Button href="/{network}/{walletType}-signup" variant="primary">Sign Up with {walletType}</Button>
</div>
