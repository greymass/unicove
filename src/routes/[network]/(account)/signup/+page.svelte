<script lang="ts">
	import * as m from '$lib/paraglide/messages.js';
	import PillGroup from '$lib/components/navigation/pillgroup.svelte';
	import { page } from '$app/stores';
	import Pageheader from '$lib/components/pageheader.svelte';
	import Stack from '$lib/components/layout/stack.svelte';
	import Button from '$lib/components/button/button.svelte';

	const { data } = $props();

	const walletTypes = {
		// webAuths: {
		// 	title: 'Web Authenticators',
		// 	description:
		// 		"Web Authenticators are convenient wallet options that don't require any installation.",
		// 	benefits: [
		// 		'No software installation needed',
		// 		'Access your account from any device with a web browser',
		// 		'Relatively secure and easy to use'
		// 	],
		// 	wallets: [{ name: 'Anchor Web', route: 'anchor' }]
		// },
		hardWallets: {
			title: 'Hardware Wallets',
			description: 'Hardware wallets are physical devices that securely store your private keys.',
			benefits: [
				'Highest level of security',
				'Offline storage of private keys',
				'Support for multiple cryptocurrencies'
			],
			wallets: [{ name: 'Ledger', route: 'ledger' }]
		},
		desktopWallets: {
			title: 'Soft Wallets',
			description:
				'Software wallets are applications you install on your computer or mobile device.',
			benefits: [
				'Easy to use and set up',
				'Convenient for frequent transactions',
				'Often free to download and use'
			],
			wallets: [
				{ name: 'Anchor', route: 'anchor/desktop' },
				{ name: 'Wombat', route: 'wombat/desktop' }
			]
		},
		mobileWallets: {
			title: 'Mobile Wallets',
			description: 'Mobile wallets are applications you install on your mobile device.',
			benefits: [
				'Convenient for on-the-go access',
				'Secure storage of your digital assets on your mobile device',
				'Quick and easy transactions from your smartphone'
			],
			wallets: [
				{ name: 'Anchor Mobile', route: 'anchor/mobile' },
				{ name: 'Wombat Mobile', route: 'wombat/mobile' },
				{ name: 'TokenPocket', route: 'tokenpocket' }
			]
		},
		extensions: {
			title: 'Browser Extensions',
			description:
				'Browser extension wallets integrate directly with your web browser for easy access.',
			benefits: [
				'Seamless integration with web applications',
				'Quick access from your browser',
				'Easy to use for web3 interactions'
			],
			wallets: [
				{ name: 'MetaMask', route: 'metamask' },
				{ name: 'Wombat', route: 'wombat/extension' }
			]
		}
	};

	const tabOptions = $derived.by(() => {
		const network = String(data.network);
		return Object.entries(walletTypes).map(([key, value]) => ({
			href: `/${network}/signup/${key}`,
			text: value.title
		}));
	});

	let currentTab = $derived($page.url.pathname.split('/')[3] || 'webAuths');

	let options = $derived(
		tabOptions.map((option) => ({
			...option,
			active: option.href.split('/')[3] === currentTab
		}))
	);

	let currentWalletType = $derived(walletTypes[currentTab as keyof typeof walletTypes]);
</script>

<Stack>
	<Pageheader title="Sign Up" subtitle="Create your account" />

	<div class="mb-6">
		<h2 class="mb-4 text-xl font-semibold">Why do I need a wallet?</h2>
		<p class="mb-4">
			A wallet is your gateway to the blockchain, allowing you to manage your digital assets and
			interact with decentralized applications.
		</p>
		<h2 class="mb-4 text-xl font-semibold">Why do I need an account?</h2>
		<p class="mb-4">
			An account on the blockchain is your unique identity, enabling you to perform transactions,
			store assets, and participate in the network.
		</p>
	</div>

	<PillGroup {options} class="mb-6" />

	<div class="container mx-auto p-4">
		<h1 class="mb-4 text-2xl font-bold">Sign Up with {currentWalletType.title}</h1>
		<p class="mb-4">{currentWalletType.description}</p>

		<h2 class="mb-2 text-xl font-semibold">Benefits:</h2>
		<ul class="mb-6 list-disc pl-5">
			{#each currentWalletType.benefits as benefit}
				<li>{benefit}</li>
			{/each}
		</ul>

		<h2 class="mb-2 text-xl font-semibold">Available Wallets:</h2>
		<ul class="mb-6 list-disc pl-5">
			{#each currentWalletType.wallets as wallet}
				<li>
					<Button href="/{data.network}/{wallet.route}">
						{wallet.name}
					</Button>
				</li>
			{/each}
		</ul>
	</div>
</Stack>
