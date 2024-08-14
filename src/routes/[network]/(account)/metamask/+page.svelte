<script lang="ts">
	import { onMount } from 'svelte';
	import Button from '$lib/components/button/button.svelte';
	import Box from '$lib/components/layout/box/box.svelte';
	import Card from '$lib/components/layout/box/card.svelte';
	import Grid from '$lib/components/layout/grid.svelte';

	let isMetaMaskInstalled = false;
	let isSnapInstalled = false;
	let account: string | null = null;

	onMount(() => {
		checkMetaMaskInstallation();
		checkSnapInstallation();
	});

	function checkMetaMaskInstallation() {
		if (typeof window.ethereum !== 'undefined') {
			isMetaMaskInstalled = true;
		}
	}

	async function checkSnapInstallation() {
		if (window.ethereum && window.ethereum.isMetaMask) {
			try {
				const result = await window.ethereum.request({
					method: 'wallet_getSnaps'
				});
				isSnapInstalled = !!result['npm:@antelope/evm-snap'];
			} catch (error) {
				console.error('Error checking Snap installation:', error);
			}
		}
	}

	function installMetaMask() {
		window.open('https://metamask.io/download/', '_blank');
	}

	async function installSnap() {
		try {
			await window.ethereum.request({
				method: 'wallet_requestSnaps',
				params: {
					'npm:@antelope/evm-snap': {}
				}
			});
			isSnapInstalled = true;
		} catch (error) {
			console.error('Error installing Snap:', error);
		}
	}

	async function createAccount() {
		if (!isMetaMaskInstalled || !isSnapInstalled) return;

		try {
			await window.ethereum.request({ method: 'eth_requestAccounts' });
			const newAccount = await window.ethereum.request({
				method: 'wallet_invokeSnap',
				params: {
					snapId: 'npm:@antelope/evm-snap',
					request: {
						method: 'createAccount',
						params: {
							chainId: '73e4385a2708e6d7048834fbc1079f2fabb17b3c125b146af438971e90716c4d' // EOS Jungle Testnet
						}
					}
				}
			});
			account = newAccount;
		} catch (error) {
			console.error('Error creating account:', error);
		}
	}
</script>

<Box>
	<h1 class="mb-4 text-2xl font-bold">Sign Up with MetaMask</h1>

	<Grid itemWidth="100%">
		<Card class="mb-4">
			<h2 class="mb-2 text-xl font-semibold">Step 1: Install MetaMask</h2>
			{#if isMetaMaskInstalled}
				<p class="text-green-600">MetaMask is installed.</p>
			{:else}
				<p class="mb-2">To get started, you need to install MetaMask:</p>
				<Button on:click={installMetaMask}>Install MetaMask</Button>
			{/if}
		</Card>

		<Card class="mb-4">
			<h2 class="mb-2 text-xl font-semibold">Step 2: Install Antelope Snap</h2>
			{#if isSnapInstalled}
				<p class="text-green-600">Antelope Snap is installed.</p>
			{:else}
				<p class="mb-2">Install the Antelope Snap for MetaMask:</p>
				<Button on:click={installSnap} disabled={!isMetaMaskInstalled}>Install Antelope Snap</Button
				>
			{/if}
		</Card>

		<Card class="mb-4">
			<h2 class="mb-2 text-xl font-semibold">Step 3: Create an Account</h2>
			{#if account}
				<p class="text-green-600">Account created: {account}</p>
			{:else}
				<p class="mb-2">Create your Antelope account:</p>
				<Button on:click={createAccount} disabled={!isMetaMaskInstalled || !isSnapInstalled}>
					Create Account
				</Button>
			{/if}
		</Card>
	</Grid>

	<Box class="mt-8 rounded-lg bg-gray-100 p-4">
		<h3 class="mb-2 text-lg font-semibold">How This Works</h3>
		<p>
			This signup method allows you to use your MetaMask wallet to interact with Antelope
			blockchains. The Antelope Snap extends MetaMask's functionality, enabling it to sign Antelope
			transactions. Once your account is created, you'll be able to use MetaMask to manage your
			Antelope assets and interact with Antelope-based applications, providing a seamless experience
			across both Ethereum and Antelope ecosystems.
		</p>
	</Box>
</Box>
