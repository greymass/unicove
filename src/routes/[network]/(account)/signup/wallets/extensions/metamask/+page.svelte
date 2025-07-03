<script lang="ts">
	import { onMount, getContext } from 'svelte';
	import { goto } from '$app/navigation';
	import { getSnapsProvider, checkIsFlask } from '@wharfkit/wallet-plugin-metamask';

	import type { UnicoveContext } from '$lib/state/client.svelte';

	import { Button } from 'unicove-components';
	import Box from '$lib/components/layout/box/box.svelte';
	import {Card} from 'unicove-components';
	import { setSnap, requestSnap } from '$lib/metamask-snap';
	import { MetaMaskState } from '$lib/state/metamask.svelte';

	const context = getContext<UnicoveContext>('state');

	const wharf = context.wharf;

	const { data } = $props();

	let metaMaskState: MetaMaskState = new MetaMaskState();

	onMount(async () => {
		if (!data.network.snapOrigin) {
			return goto(`/404`);
		}

		metaMaskState.snapProvider = await getSnapsProvider();

		if (metaMaskState.snapProvider !== null) {
			metaMaskState.snapOrigin = data.network.snapOrigin;
			metaMaskState.isFlask = await checkIsFlask(metaMaskState.snapProvider);

			if (data.network.snapOrigin) {
				setSnap(metaMaskState);
			}
		}
	});

	async function createAccountAndLogin() {
		try {
			const accountCreationResponse = await wharf.createAccount({
				chain: context.network.chain,
				pluginId: 'account-creation-plugin-metamask'
			});
			await wharf.login({
				chain: accountCreationResponse.chain,
				permissionLevel: `${accountCreationResponse.accountName}@active`,
				walletPlugin: 'wallet-plugin-metamask'
			});
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

	{#if !metaMaskState?.isMetaMaskReady}
		<Card class="mb-4">
			<h2 class="mb-2 text-xl font-semibold">Step 1: Install MetaMask</h2>
			<p class="mb-2">To get started, you need to install MetaMask:</p>
			<Button href={'https://metamask.io/download/'} blank>Install MetaMask</Button>
		</Card>
	{:else if !metaMaskState.installedSnap}
		<Card class="mb-4">
			<h2 class="mb-2 text-xl font-semibold">Step 2: Install EOS Wallet</h2>
			<p class="mb-2">Install the EOS Wallet for MetaMask:</p>
			<Button onclick={() => requestSnap(metaMaskState)}>Install EOS Wallet</Button>
		</Card>
	{:else}
		<Card class="mb-4">
			<h2 class="mb-2 text-xl font-semibold">Step 3: Create an Account</h2>
			<p class="mb-2">Create your {data.network.chain.name} account:</p>
			<Button onclick={createAccountAndLogin}>Create Account</Button>
		</Card>
	{/if}

	<Card class="mt-8 gap-2">
		<h3 class="text-lg font-semibold">How This Works</h3>
		<p>
			This signup method allows you to use your MetaMask wallet to interact with {data.network.chain
				.name}. The EOS Wallet Snap extends MetaMask's functionality, enabling it to sign {data
				.network.chain.name} transactions. Once your account is created, you'll be able to use MetaMask
			to manage your {data.network.chain.name} assets and interact with {data.network.chain
				.name}-based applications.
		</p>
	</Card>
</Box>
