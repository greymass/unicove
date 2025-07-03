<script lang="ts">
	import {Stack} from 'unicove-components';
	import {Button} from 'unicove-components';
	import { walletTypes } from './walletTypes';
	import { detectEnvironment } from '$lib/utils';
	import ChevronRight from '@lucide/svelte/icons/chevron-right';

	const { data } = $props();

	let currentEnvironment = $state(detectEnvironment());

	const currentWalletType = $derived(
		currentEnvironment ? walletTypes[currentEnvironment] : undefined
	);
	const recommendedWallet = $derived(currentWalletType?.wallets[0]);
	const otherWallets = $derived(currentWalletType?.networkWallets(String(data.network)).slice(1));

	const WalletComponent = $derived(currentWalletType?.icon);
</script>

{#if !recommendedWallet || !currentWalletType || !WalletComponent}
	<Stack class="gap-2">
		<h3 class="h3">Detecting your environment...</h3>
		<p>Please wait while we determine the best options for you.</p>
	</Stack>
{:else}
	<Stack class="gap-2">
		<h3 class="h3">Let's get started</h3>
		<p>
			There are many options to create your first account but we recommend {recommendedWallet.name} for
			most people new to EOS.
		</p>
	</Stack>

	<Stack class="rounded-2xl border border-white/20 p-4">
		<div class="flex items-start space-x-4">
			<div class="bg-mine-800 mt-2 rounded-full">
				<img src={recommendedWallet.logo} alt={`${recommendedWallet.name} logo`} width={96} />
			</div>
			<div>
				<h3 class="text-2xl font-semibold">{recommendedWallet.name}</h3>
				<p>{recommendedWallet.description}</p>
				<Stack class="mt-4 gap-2">
					<Button variant="primary" href={recommendedWallet.route}
						>Continue with {recommendedWallet.name}</Button
					>
				</Stack>
			</div>
		</div>
	</Stack>
	<div class="my-2 border-t border-white/20"></div>

	<h3 class="h3">Other {currentWalletType?.title}</h3>

	{#if otherWallets}
		{#each otherWallets as wallet}
			<Stack>
				<a
					href={wallet.route}
					class="group hover:bg-mine-950 focus-visible:ring-solar-500 grid grid-cols-[auto_1fr_auto] items-center gap-4 rounded-2xl border
					border-white/20 p-4 focus-visible:ring-2 focus-visible:outline focus-visible:outline-transparent"
				>
					<div class="bg-mine-900/60 rounded-full">
						{#if wallet.logo}
							<img src={wallet.logo} alt={`${wallet.name} logo`} width="52" />
						{/if}
					</div>
					<div class="space-y-1">
						<h4 class="text-xl font-semibold">
							{wallet.name}
						</h4>
						<p>{wallet.description}</p>
					</div>
					<ChevronRight class="group-hover:stroke-primary size-6" />
				</a>
			</Stack>
		{/each}
	{/if}

	{#if currentWalletType}
		<Stack>
			<a
				href="/{data.network}/signup/wallets"
				class="group hover:bg-mine-950 focus-visible:ring-solar-500 grid grid-cols-[auto_1fr_auto] items-center gap-4 rounded-2xl border
				border-white/20 p-4 focus-visible:ring-2 focus-visible:outline focus-visible:outline-transparent"
			>
				<div class="bg-mine-900/60 rounded-full p-3">
					{#if currentWalletType.icon}
						{@const Component = currentWalletType.icon}
						<Component class="group-hover:stroke-primary size-6" />
					{/if}
				</div>
				<div class="space-y-1">
					<h4 class="text-xl font-semibold">More Options</h4>
					<p>
						Choose from {Object.values(walletTypes)
							.filter((type) => type.type !== currentWalletType.type)
							.map((type) => type.title.toLowerCase())
							.join(', ')
							.replace(/,([^,]*)$/, ' and$1')}
					</p>
				</div>
				<ChevronRight class="group-hover:stroke-primary size-6" />
			</a>
		</Stack>
	{/if}
{/if}
