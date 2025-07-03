<script lang="ts">
	import { page } from '$app/stores';
	import {Button} from 'unicove-components';
	import {Stack} from 'unicove-components';
	import { walletTypes } from '../../walletTypes';
	import ChevronRight from '@lucide/svelte/icons/chevron-right';

	const { data } = $props();

	// const tabOptions = $derived.by(() => {
	// 	const network = String(data.network);
	// 	return Object.entries(walletTypes).map(([key, value]) => ({
	// 		href: `/${network}/signup/${key}`,
	// 		text: value.title
	// 	}));
	// });

	const defaultWalletType = Object.keys(walletTypes)[0];

	let currentTab = $derived($page.params.walletType || defaultWalletType);

	// let options = $derived(
	// 	tabOptions.map((option) => ({
	// 		...option,
	// 		active: option.href.split('/')[3] === currentTab
	// 	}))
	// );

	let currentWalletType = $derived(
		walletTypes[currentTab as keyof typeof walletTypes] || walletTypes[defaultWalletType]
	);
</script>

<Stack class="gap-2">
	<h3 class="h3">Sign Up with {currentWalletType.title}</h3>
	<p>{currentWalletType.description}</p>
</Stack>

<Stack class="gap-2">
	<h3 class="h3">Benefits</h3>

	<ul class="list-inside list-disc">
		{#each currentWalletType.benefits as benefit}
			<li class="">{benefit}</li>
		{/each}
	</ul>
</Stack>

<Stack>
	<h3 class="h2">Available Wallets</h3>
	<Stack>
		{#each currentWalletType.networkWallets(String(data.network)) as wallet}
			<a
				href="/{data.network}/{wallet.route}"
				class="group hover:bg-mine-950 focus-visible:ring-solar-500 grid grid-cols-[auto_1fr_auto] items-center gap-4 rounded-2xl border
				border-white/20 p-4 focus-visible:ring-2 focus-visible:outline focus-visible:outline-transparent"
			>
				<div class="grid size-12 place-items-center">
					{#if wallet.logo}
						<img src={wallet.logo} alt={wallet.name} class="" />
					{:else}
						<div class="bg-mine-900/60 rounded-full p-3"></div>
					{/if}
				</div>
				<div class="space-y-1">
					<h4 class="text-xl font-semibold">
						{wallet.name}
					</h4>
					<!-- <p>{wallet.description}</p> -->
				</div>
				<ChevronRight class="group-hover:stroke-primary size-6" />
			</a>
		{/each}

		<Button variant="secondary" href="/{data.network}/signup/wallets">Back</Button>
	</Stack>
	<Stack class="gap-2">
		<h3 class="h3">Why do I need a wallet?</h3>
		<p>
			A wallet is your gateway to the blockchain, allowing you to manage your digital assets and
			interact with decentralized applications.
		</p>
	</Stack>
</Stack>
