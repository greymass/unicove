<script lang="ts">
	import { getContext, onMount, type Snippet } from 'svelte';
	import { goto } from '$app/navigation';
	import { getSnapsProvider, checkIsFlask } from '@wharfkit/wallet-plugin-metamask';

	import Button from '$lib/components/button/button.svelte';
	import Box from '$lib/components/layout/box/box.svelte';
	import Card from '$lib/components/layout/box/card.svelte';
	import Grid from '$lib/components/layout/grid.svelte';
	import { checkForSnap, getSnaps, requestSnap } from '$lib/metamask-snap';
	import EOS from '$lib/assets/EOS@2x.svg';
	import Metamask from '$lib/assets/metamask.svg';
	import { MetaMaskState } from '$lib/state/metamask.svelte';
	import { Stack } from '$lib/components/layout/index.js';
	import type { UnicoveContext } from '$lib/state/client.svelte.js';

	const { data } = $props();
	const context = getContext<UnicoveContext>('state');

	let metaMaskState: MetaMaskState = new MetaMaskState();
	let latestVersion: string | undefined = $state();

	let currentVersion = $derived(metaMaskState.installedSnap?.version);
	let needsUpdate = $derived(
		latestVersion && metaMaskState.installedSnap?.version !== latestVersion
	);

	$effect(() => {
		if (metaMaskState.isMetaMaskReady) {
			if (metaMaskState.snapProvider !== null) {
				metaMaskState.snapOrigin = data.network.snapOrigin;
				checkIsFlask(metaMaskState.snapProvider).then((isFlask) => {
					metaMaskState.isFlask = isFlask;
					checkForSnap(metaMaskState).then((isInstalled) => {
						metaMaskState.isInstalled = isInstalled;
						if (isInstalled) {
							connect();
						}
					});
				});
			}
		}
	});

	onMount(async () => {
		if (!data.network.snapOrigin) {
			return goto(`/404`);
		}

		metaMaskState.snapProvider = await getSnapsProvider();
	});

	async function connect() {
		await requestSnap(metaMaskState);
		await getLatestSnapVersion();
	}

	async function getLatestSnapVersion() {
		if (!data.network.snapOrigin?.includes('npm:')) return;

		const npmPackage = data.network.snapOrigin?.split(':')[1];

		const response = await fetch(`https://registry.npmjs.org/${npmPackage}/latest`);
		const packageInfo = await response.json();
		latestVersion = packageInfo.version;
	}

	async function handleUpdateSnap() {
		if (!needsUpdate) return;

		try {
			// Force install latest version by passing it explicitly
			await requestSnap(metaMaskState, latestVersion);
		} catch (error) {
			console.error('Error updating snap:', error);
			alert('Error updating the EOS Wallet snap. Please try again.');
		}
	}

	async function login() {
		context.wharf.login({
			chain: data.network.chain,
			walletPlugin: 'wallet-plugin-metamask'
		});
	}
</script>

{#snippet textblock(props: {
	title: string;
	text: string;
	children?: Snippet;
	button?: { text: string; href: string };
})}
	<Stack class="max-w-md items-start">
		<h3 class="h3 leading-tight">{props.title}</h3>
		<p>{props.text}</p>
		{#if props.button && props.button.href}
			<Button class="mt-1" href={props.button.href}>{props.button.text}</Button>
		{/if}
		{@render props.children?.()}
	</Stack>
{/snippet}

<Box>
	<section class="col-span-full @container">
		<div class="grid min-h-72 rounded-2xl bg-mineShaft-950 px-4 @xl:grid-cols-2 @xl:gap-4">
			<div class="grid place-items-center">
				<svg
					class="col-start-1 row-start-1 h-full w-full object-cover"
					width="635"
					height="296"
					viewBox="0 0 635 296"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
				>
					<path
						d="M201.577-49.292h231.851l115.925 200.789-115.925 200.788H201.577L85.652 151.497 201.577-49.292Z"
						stroke="#fff"
						stroke-opacity=".1"
					/>
					<path
						d="M179.906 13.903 367.864-36.46l137.594 137.594-50.363 187.957-187.957 50.363L129.543 201.86l50.363-187.957Z"
						stroke="#fff"
						stroke-opacity=".5"
					/>
					<path
						d="M179.009 72.29 317.506-7.424l138.497 79.712v159.422l-138.497 79.712-138.497-79.712V72.289Z"
						stroke="#fff"
					/>
				</svg>
				<div
					class="col-start-1 row-start-1 grid max-w-sm grid-cols-3 items-center justify-items-center"
				>
					<img class="h-40" src={Metamask} alt="metamask" />
					<svg width="36" height="36" fill="none" xmlns="http://www.w3.org/2000/svg">
						<path d="M18.008 0v36M36.008 18h-36" stroke="#fff" />
					</svg>
					<img class="h-40 rounded-full bg-mineShaft-950 px-2 py-4" src={EOS} alt="eos" />
				</div>
			</div>

			<Box class="grid place-items-center py-8">
				{@render textblock({
					title: `EOS Wallet for MetaMask`,
					text: 'The EOS Wallet snap for MetaMask allows you to interact with Unicove and other EOS-based apps while using one of the most popular crypto wallets.'
				})}
			</Box>
		</div>
	</section>
	<Grid class="mt-4" itemWidth="100%">
		<Card class="mb-4 justify-items-start text-balance">
			{#if !metaMaskState.isMetaMaskReady}
				<h2 class="mb-2 text-xl font-semibold">Add EOS Wallet to MetaMask!</h2>
				<p>
					This page on Unicove can help guide you through the process of installing the EOS Wallet
					snap in your MetaMask wallet. Please install MetaMask first.
				</p>
				<Button href={'https://metamask.io/download/'} blank>Install MetaMask</Button>
				<p>
					Note: If MetaMask is already installed, you may need to grant permissions for Unicove
					first by opening MetaMask.
				</p>
			{:else if currentVersion}
				<h2 class="mb-2 text-xl font-semibold">EOS Wallet + MetaMask</h2>
				{#if needsUpdate}
					<p class="mb-2">
						A new version of the EOS Wallet is available. Click the button below to update to the
						latest version ({latestVersion}).
					</p>
					<Button onclick={handleUpdateSnap}>Update EOS Wallet</Button>
				{:else}
					<p class="mb-2">MetaMask and the EOS Wallet are both installed and up-to-date.</p>
					<p>
						If you don't already have an EOS account you can create one now. If you have already
						created an account you can login with MetaMask.
					</p>
					<Button onclick={login}>Login</Button>
					<Button href={`/${data.network}/signup/wallets/extensions/metamask`}
						>Create an account</Button
					>
				{/if}
			{:else}
				<h2 class="mb-2 text-xl font-semibold">Add EOS Wallet to MetaMask!</h2>
				<p class="mb-2">
					With MetaMask connected, next the EOS Wallet Snap needs to be installed to make it
					compatible with the EOS network.
				</p>
				<Button onclick={connect}>Install the EOS Wallet</Button>
				<p>
					<a href="https://metamask.io/snaps/"> MetaMask Snaps </a> are community build plugins to extend
					the functionality of MetaMask. This new feature allows blockchains like the EOS Network to
					be accessed through MetaMask.
				</p>
			{/if}
		</Card>
	</Grid>

	<div class="mt-8 space-y-4">
		<h3 class="text-2xl font-semibold">FAQ</h3>

		<h4 class="text-md font-semibold">How do I install the EOS Wallet?</h4>
		<p>
			The EOS Wallet is a <a href="https://metamask.io/snaps/">MetaMask Snap</a> can be installed
			directly from this page on Unicove or from the EOS Wallet page in the
			<a href="https://snaps.metamask.io/">MetaMask Snaps Directory</a>.
		</p>

		<h4 class="text-md font-semibold">What does the EOS Wallet do?</h4>
		<p>
			The EOS Wallet allows you to use MetaMask a web3 wallet for an EOS Network account. Any dapp
			compatible with the EOS Wallet can be used with MetaMask.
		</p>

		<h4 class="text-md font-semibold">What does the EOS Wallet not do?</h4>
		<p>
			The EOS Wallet's only purpose is to sign transactions and will need to be paired with a
			companion dapp, such as Unicove, in order to manage your account.
		</p>

		<h4 class="text-md font-semibold">How do I sign transactions using the EOS Wallet?</h4>
		<p>Please see our guide on How to Sign Transactions on the EOS network with MetaMask</p>

		<h4 class="text-md font-semibold">Is the EOS Wallet free to use?</h4>
		<p>
			Yes, the EOS Wallet software is completely free to use. However, accounts on the EOS Network
			require a small amount of EOS before they are created.
		</p>
		<p>
			Unicove is currently paying this cost and offering one free account per user, which requires
			logging in with a valid 3rd party account. Currently only Apple and Google accounts are
			supported.
		</p>
		<h4 class="text-md font-semibold">Where can I view and manage my EOS account?</h4>
		<p>
			Currently Unicove is the first web wallet that allows you to manage your EOS account using
			MetaMask. We would expect other wallets to follow suit in the future.
		</p>
		<p>
			You can view your account on any EOS Network block explorer, like Unicove, simply by searching
			for the account name.
		</p>

		<h4 class="text-md font-semibold">
			Is my private key or recovery phrase exposed when using the EOS Wallet Snap?
		</h4>
		<p>
			The EOS Wallet uses a private key derived from your MetaMask seed phrase using the BIP-0044
			and the EOS coin type. This private key is only ever used for EOS accounts and the EOS Wallet
			cannot access any of your other keys. The EOS Wallet never exposes this private key and does
			not have access to your seed phrase.
		</p>

		<h4 class="text-md font-semibold">Can I access all EOS apps?</h4>
		<p>
			It's possible to access any EOS Network app, provided the app developers have integrated the
			required SDKs. The EOS Wallet and MetaMask can be added to any web app using <a
				href="https://wharfkit.com/">Wharf</a
			>
			alongside the
			<a href="https://github.com/wharfkit/wallet-plugin-metamask">MetaMask Wallet Plugin</a>.
			Unicove itself is <a href="https://github.com/greymass/2nicove">open source</a>
			and serves as reference material for how this integration can be performed.
		</p>

		<h4 class="text-md font-semibold">How do I reach out for EOS Wallet support?</h4>
		<p>
			If you have any issues with the EOS Wallet itself, please feel free to reach out to us at
			support@greymass.com or by visiting our Support portal at:
		</p>
		<p><a href="https://support.greymass.com">https://support.greymass.com</a></p>
	</div>
</Box>
