<script lang="ts">
	import { onMount, getContext } from 'svelte';
	import { goto } from '$app/navigation';
	import type { MetaMaskInpageProvider } from '@metamask/providers';
	import { page } from '$app/stores';
	import { checkIsFlask, getSnapsProvider } from '@wharfkit/wallet-plugin-metamask';

	import type { UnicoveContext } from '$lib/state/client.svelte';

	import Button from '$lib/components/button/button.svelte';
	import Box from '$lib/components/layout/box/box.svelte';
	import Card from '$lib/components/layout/box/card.svelte';
	import Grid from '$lib/components/layout/grid.svelte';
	import { setSnap, requestSnap } from '$lib/metamask-snap';
	import { getChainDefinitionFromParams } from '$lib/state/network.svelte';
	import { MetaMaskState } from '$lib/state/metamask.svelte';

	let provider: MetaMaskInpageProvider;

	const context = getContext<UnicoveContext>('state');

	const wharf = context.wharf;

	const { data } = $props();

	let metaMaskState: MetaMaskState = new MetaMaskState();

	onMount(async () => {
		console.log('Metamask page mounted');
		if (!data.network.snapOrigin) {
			return goto(`/404`);
		}

		metaMaskState.snapProvider = await getSnapsProvider();

		console.log({ metaMaskState });

		if (metaMaskState.snapProvider !== null) {
			metaMaskState.snapOrigin = data.network.snapOrigin;
			metaMaskState.isFlask = await checkIsFlask(provider);

			console.log({ metaMaskState });

			if (data.network.snapOrigin) {
				setSnap(metaMaskState);
			}
		}
	});

	async function createAccountAndLogin() {
		try {
			const accountCreationResponse = await wharf.createAccount({
				chain: getChainDefinitionFromParams($page.params.network),
				pluginId: 'account-creation-plugin-metamask'
			});
			console.log(`Account created: ${accountCreationResponse.accountName}`);

			await wharf.login();
		} catch (error) {
			console.error('Error creating account:', error);
			alert(
				`Error creating account through Metamask. Please make sure that the Antelope snap is enabled.`
			);
		}
	}
</script>

<Box>
	<h1 class="mb-4 text-2xl font-bold">Sign Up with MetaMask</h1>

	<Grid itemWidth="100%">
		{#if !metaMaskState?.isMetaMaskReady}
			<Card class="mb-4">
				<h2 class="mb-2 text-xl font-semibold">Step 1: Install MetaMask</h2>
				<p class="mb-2">To get started, you need to install MetaMask:</p>
				<Button href={'https://metamask.io/download/'} blank>Install MetaMask</Button>
			</Card>
		{:else if !metaMaskState.installedSnap}
			<Card class="mb-4">
				<h2 class="mb-2 text-xl font-semibold">Step 2: Install Antelope Snap</h2>
				<p class="mb-2">Install the Antelope Snap for MetaMask:</p>
				<Button onclick={() => requestSnap(metaMaskState)}>Install Antelope Snap</Button>
			</Card>
		{:else}
			<Card class="mb-4">
				<h2 class="mb-2 text-xl font-semibold">Step 3: Create an Account</h2>
				<p class="mb-2">Create your Antelope account:</p>
				<Button onclick={createAccountAndLogin}>Create Account</Button>
			</Card>
		{/if}
	</Grid>

	<Box class="mt-8 rounded-lg bg-gray-800 p-4 text-white">
		<h3 class="mb-2 text-lg font-semibold">How This Works</h3>
		<p>
			This signup method allows you to use your MetaMask wallet to interact with Antelope
			blockchains. The Antelope Snap extends MetaMask's functionality, enabling it to sign Antelope
			transactions. Once your account is created, you'll be able to use MetaMask to manage your
			Antelope assets and interact with Antelope-based applications.
		</p>
	</Box>
</Box>
