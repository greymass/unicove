<script lang="ts">
	import Stack from '$lib/components/layout/stack.svelte';
	import Button from '$lib/components/button/button.svelte';
	import { walletTypes } from './walletTypes';
	import { detectEnvironment } from '$lib/utils';
	import { ChevronRight } from 'lucide-svelte';

	const { data } = $props();

	const currentEnvironment = detectEnvironment();
	const currentWalletType = walletTypes[currentEnvironment];
	const recommendedWallet = currentWalletType.wallets[0];
	const otherWallets = currentWalletType.wallets.slice(1);
</script>

<Stack class="gap-2">
	<h3 class="h3">Lets's get started</h3>
	<p>
		There are many options to create your first account but we recommend {recommendedWallet.name} for
		most people new to EOS.
	</p>
</Stack>

<Stack class="rounded-2xl border border-white/20 p-4">
	<div class="flex items-start space-x-4">
		<div class="mt-2 rounded-full bg-mineShaft-800">
			{#if recommendedWallet.logo}
				<img src={recommendedWallet.logo} alt={`${recommendedWallet.name} logo`} width="72" />
			{/if}
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
<div class="my-6 border-t border-white/20"></div>

{#each otherWallets as wallet}
	<Stack>
		<a
			href={wallet.route}
			class="group grid grid-cols-[auto_1fr_auto] items-center gap-4 rounded-2xl border border-white/20 p-4
			hover:bg-mineShaft-950 focus-visible:outline focus-visible:outline-transparent focus-visible:ring-2 focus-visible:ring-solar-500"
		>
			<div class="rounded-full bg-mineShaft-900/60">
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
			<ChevronRight class="size-6 group-hover:stroke-skyBlue-500" />
		</a>
	</Stack>
{/each}

<Stack>
	<a
		href="/{data.network}/signup/wallets"
		class="group grid grid-cols-[auto_1fr_auto] items-center gap-4 rounded-2xl border border-white/20 p-4
hover:bg-mineShaft-950 focus-visible:outline focus-visible:outline-transparent focus-visible:ring-2 focus-visible:ring-solar-500"
	>
		<div class="rounded-full bg-mineShaft-900/60 p-3">
			{#if currentWalletType.icon}
				{@const Component = currentWalletType.icon}
				<Component class="size-6 group-hover:stroke-skyBlue-500" />
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
		<ChevronRight class="size-6 group-hover:stroke-skyBlue-500" />
	</a>
</Stack>
