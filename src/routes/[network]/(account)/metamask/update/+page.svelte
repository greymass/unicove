<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { getSnapsProvider, checkIsFlask } from '@wharfkit/wallet-plugin-metamask';

	import Button from '$lib/components/button/button.svelte';
	import Box from '$lib/components/layout/box/box.svelte';
	import Card from '$lib/components/layout/box/card.svelte';
	import Grid from '$lib/components/layout/grid.svelte';
	import { requestSnap } from '$lib/metamask-snap';
	import { MetaMaskState } from '$lib/state/metamask.svelte';

	const { data } = $props();

	let metaMaskState: MetaMaskState = new MetaMaskState();
	let latestVersion: string | undefined = $state();

	let currentVersion = $derived(metaMaskState.installedSnap?.version);
	let needsUpdate = $derived(
		latestVersion && metaMaskState.installedSnap?.version !== latestVersion
	);

	onMount(async () => {
		if (!data.network.snapOrigin) {
			return goto(`/404`);
		}

		metaMaskState.snapProvider = await getSnapsProvider();

		if (metaMaskState.snapProvider !== null) {
			metaMaskState.snapOrigin = data.network.snapOrigin;
			metaMaskState.isFlask = await checkIsFlask(metaMaskState.snapProvider);
		}

		await requestSnap(metaMaskState);

		await getLatestSnapVersion();
	});

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
</script>

<Box>
	<Grid itemWidth="100%">
		<p class="mb-4">
			This page allows you to install updates to your EOS Wallet snap for MetaMask.
		</p>
		{#if !metaMaskState?.isMetaMaskReady}
			<Card class="mb-4">
				<h2 class="mb-2 text-xl font-semibold">MetaMask Not Detected</h2>
				<p class="mb-2">Please install MetaMask to continue:</p>
				<Button href={'https://metamask.io/download/'} blank>Install MetaMask</Button>
			</Card>
		{:else}
			<Card class="mb-4">
				<p class="mb-2">Currently installed version: {currentVersion}</p>
				{#if latestVersion}
					<p class="mb-2">Latest version: {latestVersion}</p>
				{/if}
				{#if needsUpdate}
					<p class="mb-2">A new version is available. Update your EOS Wallet snap:</p>
					<Button onclick={handleUpdateSnap}>Update EOS Wallet</Button>
				{:else}
					<p class="mb-2">Your EOS Wallet snap is up to date!</p>
				{/if}
			</Card>
		{/if}
	</Grid>

	<Card class="mt-8 gap-2">
		<h3 class="text-lg font-semibold">About Updates</h3>
		<p>
			Keeping your EOS Wallet snap up to date ensures you have the latest features and security
			improvements. The update process is quick and maintains all your existing accounts and
			settings.
		</p>
	</Card>
</Box>
