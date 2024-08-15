<script lang="ts">
	import { onMount } from 'svelte';
	import type { MetaMaskInpageProvider } from '@metamask/providers';

	import Button from '$lib/components/button/button.svelte';
	import Box from '$lib/components/layout/box/box.svelte';
	import Card from '$lib/components/layout/box/card.svelte';
	import Grid from '$lib/components/layout/grid.svelte';
	import { getWharf } from '$lib/state/client/wharf.svelte';
	import {
		snapProvider,
		isFlask,
		isMetaMaskReady,
		installedSnap
	} from '$lib/state/metamask.svelte';
	import { setSnap, requestSnap } from '$lib/metamask/snap';
	import { checkIsFlask, getSnapsProvider } from '$lib/metamask/metamask';

	let provider: MetaMaskInpageProvider;

	const wharf = getWharf();

	onMount(async () => {
		snapProvider.set(await getSnapsProvider());

		if ($snapProvider !== null) {
			provider = $snapProvider; // gotta be a better way of narrowing this type
			isFlask.set(await checkIsFlask(provider));
			setSnap();
		}
	});

	function installMetaMask() {
		window.open('https://metamask.io/download/', '_blank');
	}

	async function createAccount() {
		try {
			const accountCreationResponse = await wharf.createAccount();
			alert(`Account created: ${accountCreationResponse.accountName}`);
		} catch (error) {
			console.error('Error creating account:', error);
			alert(`Error creating account: ${error}`);
		}
	}
</script>

<Box>
	<h1 class="mb-4 text-2xl font-bold">Sign Up with MetaMask</h1>

	<Grid itemWidth="100%">
		<Card class="mb-4">
			<h2 class="mb-2 text-xl font-semibold">Step 1: Install MetaMask</h2>
			{#if $isMetaMaskReady}
				<p class="text-green-600">MetaMask is installed.</p>
			{:else}
				<p class="mb-2">To get started, you need to install MetaMask:</p>
				<Button on:click={installMetaMask}>Install MetaMask</Button>
			{/if}
		</Card>

		<Card class="mb-4">
			<h2 class="mb-2 text-xl font-semibold">Step 2: Install Antelope Snap</h2>
			{#if $installedSnap}
				<p class="text-green-600">Antelope Snap is installed.</p>
			{:else}
				<p class="mb-2">Install the Antelope Snap for MetaMask:</p>
				<Button on:click={() => requestSnap()} disabled={!$isMetaMaskReady}
					>Install Antelope Snap</Button
				>
			{/if}
		</Card>

		<Card class="mb-4">
			<h2 class="mb-2 text-xl font-semibold">Step 3: Create an Account</h2>
			<p class="mb-2">Create your Antelope account:</p>
			<Button onclick={createAccount} disabled={!$isMetaMaskReady || !$installedSnap}>
				Create Account
			</Button>
		</Card>
	</Grid>

	<Box class="mt-8 rounded-lg bg-gray-100 p-4">
		<h3 class="mb-2 text-lg font-semibold">How This Works</h3>
		<p>
			This signup method allows you to use your MetaMask wallet to interact with Antelope
			blockchains. The Antelope Snap extends MetaMask's functionality, enabling it to sign Antelope
			transactions. Once your account is created, you'll be able to use MetaMask to manage your
			Antelope assets and interact with Antelope-based applications.
		</p>
	</Box>
</Box>
