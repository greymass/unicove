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
	import {
		snapProvider,
		isFlask,
		isMetaMaskReady,
		installedSnap,
		snapOrigin
	} from '$lib/state/metamask.svelte';
	import { setSnap, requestSnap } from '$lib/metamask-snap';
	import { getChainDefinitionFromParams } from '$lib/state/network.svelte';

	let provider: MetaMaskInpageProvider;

	const context = getContext<UnicoveContext>('state');

	const wharf = context.wharf;

	const { data } = $props();

	onMount(async () => {
		snapProvider.set(await getSnapsProvider());

		if (!data.network.snapOrigin) {
			// We may want to do this in the load function so it works on the SSR side.
			return goto(`/404`);
		}

		if ($snapProvider !== null) {
			provider = $snapProvider;
			snapOrigin.set(data.network.snapOrigin);
			isFlask.set(await checkIsFlask(provider));

			if (data.network.snapOrigin) {
				setSnap(data.network.snapOrigin);
			}
		}
	});

	function installMetaMask() {
		window.open('https://metamask.io/download/', '_blank');
	}

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
		<Card class="mb-4">
			<h2 class="mb-2 text-xl font-semibold">Step 1: Install MetaMask</h2>
			{#if $isMetaMaskReady}
				<p class="text-green-600">MetaMask is installed.</p>
			{:else}
				<p class="mb-2">To get started, you need to install MetaMask:</p>
				<Button href={'https://metamask.io/download/'}>Install MetaMask</Button>
			{/if}
		</Card>

		<Card class="mb-4">
			<h2 class="mb-2 text-xl font-semibold">Step 2: Install Antelope Snap</h2>
			{#if $installedSnap}
				<p class="text-green-600">Antelope Snap is installed.</p>
			{:else}
				<p class="mb-2">Install the Antelope Snap for MetaMask:</p>
				<Button onclick={() => requestSnap(data.network.snapOrigin)} disabled={!$isMetaMaskReady}
					>Install Antelope Snap</Button
				>
			{/if}
		</Card>

		<Card class="mb-4">
			<h2 class="mb-2 text-xl font-semibold">Step 3: Create an Account</h2>
			<p class="mb-2">Create your Antelope account:</p>
			<Button onclick={createAccountAndLogin} disabled={!$isMetaMaskReady || !$installedSnap}>
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
