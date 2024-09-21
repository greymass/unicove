<script lang="ts">
	import * as m from '$lib/paraglide/messages.js';
	import PillGroup from '$lib/components/navigation/pillgroup.svelte';
	import { page } from '$app/stores';
	import Pageheader from '$lib/components/pageheader.svelte';
	import Stack from '$lib/components/layout/stack.svelte';
	import Button from '$lib/components/button/button.svelte';
	import { walletTypes } from '../walletTypes.js';

	const { data } = $props();

	const tabOptions = $derived.by(() => {
		const network = String(data.network);
		return Object.entries(walletTypes).map(([key, value]) => ({
			href: `/${network}/signup/${key}`,
			text: value.title
		}));
	});

	const defaultWalletType = Object.keys(walletTypes)[0];

	let currentTab = $derived($page.params.walletType || defaultWalletType);

	let options = $derived(
		tabOptions.map((option) => ({
			...option,
			active: option.href.split('/')[3] === currentTab
		}))
	);

	let currentWalletType = $derived(
		walletTypes[currentTab as keyof typeof walletTypes] || walletTypes[defaultWalletType]
	);
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
		<h2 class="mb-4 text-xl font-semibold">Available Wallets:</h2>
		<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
			{#each currentWalletType.wallets as wallet}
				<div class="flex justify-center">
					<Button href="/{data.network}/{wallet.route}" class="w-full">
						{wallet.name}
					</Button>
				</div>
			{/each}
		</div>
	</div>
</Stack>
