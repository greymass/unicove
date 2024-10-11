<script lang="ts">
	import Stack from '$lib/components/layout/stack.svelte';
	import Button from '$lib/components/button/button.svelte';
	import { walletTypes } from './walletTypes';
	import { detectEnvironment } from '$lib/utils';
	import WalletButton from './components/OptionButton.svelte';

	const { data } = $props();

	const currentEnvironment = detectEnvironment();
	const recommendedWalletType = walletTypes[currentEnvironment];
	const recommendedWallet = recommendedWalletType.wallets[0];
</script>

<Stack class="gap-2">
	<h3 class="h3">Lets's get started</h3>
	<p>
		There are many options to setup your first account, but for new users we recommend the following
		wallet for your current platform. Feel free to explore other platforms and wallet options.
	</p>
</Stack>

<Stack class="gap-2">
	<h3 class="h3">Why do I need an account?</h3>
	<p>
		An account on the blockchain is your unique identity, enabling you to perform transactions,
		store assets, and participate in the network.
	</p>
</Stack>

<Stack>
	<h3 class="h2">Choose A Wallet Type</h3>
	<Stack>
		<WalletButton wallet={recommendedWalletType} network={String(data.network)} />
	</Stack>
</Stack>

<Stack class="rounded-2xl border border-white/20 p-4">
	<div class="flex items-center space-x-4">
		<div class="rounded-full bg-mineShaft-800">
			{#if recommendedWallet.logo}
				<img src={recommendedWallet.logo} alt={`${recommendedWallet.name} logo`} />
			{/if}
		</div>
		<h3 class="text-2xl font-semibold">{recommendedWallet.name}</h3>
	</div>
	<p class="text-gray-300">{recommendedWallet.description}</p>
	<Stack class="gap-2">
		<Button variant="primary" href={recommendedWallet.route}>Setup Wallet</Button>
		<Button variant="secondary" href={recommendedWallet.route}>Select another wallet</Button>
	</Stack>
</Stack>
