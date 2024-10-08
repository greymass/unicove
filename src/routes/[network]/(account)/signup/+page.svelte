<script lang="ts">
	import Stack from '$lib/components/layout/stack.svelte';
	import { ChevronRight } from 'lucide-svelte';
	import { walletTypes, type WalletType } from './walletTypes';

	const { data } = $props();
</script>

{#snippet walletButton(wallet: WalletType)}
	<a
		href="/{data.network}/signup/wallet-type/{wallet.type}"
		class="group grid grid-cols-[auto_1fr_auto] items-center gap-4 rounded-2xl border border-white/20 p-4
hover:bg-mineShaft-950 focus-visible:outline focus-visible:outline-transparent focus-visible:ring-2 focus-visible:ring-solar-500"
	>
		<div class="rounded-full bg-mineShaft-900/60 p-3">
			<svelte:component this={wallet.icon} class="size-6 group-hover:stroke-skyBlue-500 " />
		</div>
		<div class="space-y-1">
			<h4 class="text-xl font-semibold">
				{wallet.title}
			</h4>
			<p>{wallet.description}</p>
		</div>
		<ChevronRight class="size-6 group-hover:stroke-skyBlue-500" />
	</a>
{/snippet}

<Stack
	class="gap-7 *:z-10 before:absolute before:-inset-4 before:z-0 before:bg-shark-900/10 md:mx-auto md:max-w-md md:p-6 md:before:inset-0 md:before:rounded-2xl"
>
	<Stack class="gap-2">
		<h3 class="h3">Why do I need a wallet?</h3>
		<p>
			A wallet is your gateway to the blockchain, allowing you to manage your digital assets and
			interact with decentralized applications.
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
			{#each Object.values(walletTypes) as wallet}
				{@render walletButton(wallet)}
			{/each}
		</Stack>
	</Stack>
</Stack>
