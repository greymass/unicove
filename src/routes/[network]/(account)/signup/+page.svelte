<script lang="ts">
	import Stack from '$lib/components/layout/stack.svelte';
	import Button from '$lib/components/button/button.svelte';
	import { walletTypes } from './walletTypes';
	import { detectEnvironment } from '$lib/utils';
	import { ChevronRight } from 'lucide-svelte';

	const { data } = $props();

	const currentEnvironment = detectEnvironment();
	const currentWalletType = walletTypes[currentEnvironment];
	const currentWalletTypePath = `/${data.network}/signup/wallets/${currentWalletType.type}`;
	const recommendedWallet = currentWalletType.wallets[0];
</script>

<Stack class="gap-2">
	<h3 class="h3">Lets's get started</h3>
	<p>
		There are many options to setup your first account, but for new users we recommend the following
		wallet for your current platform. Feel free to explore other platforms and wallet options.
	</p>
</Stack>

<Stack>
	<a
		href="/{data.network}/signup/wallets"
		class="group grid grid-cols-[auto_1fr_auto] items-center gap-4 rounded-2xl border border-white/20 p-4
hover:bg-mineShaft-950 focus-visible:outline focus-visible:outline-transparent focus-visible:ring-2 focus-visible:ring-solar-500"
	>
		<div class="rounded-full bg-mineShaft-900/60 p-3">
			<svelte:component
				this={currentWalletType.icon}
				class="size-6 group-hover:stroke-skyBlue-500 "
			/>
		</div>
		<div class="space-y-1">
			<h4 class="text-xl font-semibold">
				{currentWalletType.title}
			</h4>
			<p>{currentWalletType.description}</p>
		</div>
		<ChevronRight class="size-6 group-hover:stroke-skyBlue-500" />
	</a>
</Stack>

<Stack class="rounded-2xl border border-white/20 p-4">
	<div class="flex items-center space-x-4">
		<div class="rounded-full bg-mineShaft-800">
			{#if recommendedWallet.logo}
				<img src={recommendedWallet.logo} alt={`${recommendedWallet.name} logo`} />
			{/if}
		</div>
		<div>
			<h3 class="text-2xl font-semibold">{recommendedWallet.name}</h3>
			<p class="text-gray-300">{recommendedWallet.description}</p>
		</div>
	</div>
	<Stack class="gap-2">
		<Button variant="primary" href={recommendedWallet.route}>Get Started</Button>
		<Button variant="secondary" href={currentWalletTypePath}>Select another wallet</Button>
	</Stack>
</Stack>

<Stack class="gap-2">
	<h3 class="h3">Why do I need an account?</h3>
	<p>
		An account on the blockchain is your unique identity, enabling you to perform transactions,
		store assets, and participate in the network.
	</p>
</Stack>

<Stack class="gap-2">
	<h3 class="h3">Why do I need a wallet?</h3>
	<p>
		A wallet is your gateway to the blockchain, allowing you to manage your digital assets and
		interact with decentralized applications.
	</p>
</Stack>
