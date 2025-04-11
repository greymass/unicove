<script lang="ts">
	import Stack from '$lib/components/layout/stack.svelte';
	import ChevronRight from 'lucide-svelte/icons/chevron-right';
	import { walletTypes } from '../walletTypes';
	import Button from '$lib/components/button/button.svelte';

	const { data } = $props();
</script>

<Stack>
	<h3 class="h2">Choose A Wallet Type</h3>
	<Stack>
		{#each Object.values(walletTypes) as walletType}
			<a
				href="/{data.network}/signup/wallets/{walletType.type}"
				class="group hover:bg-mine-950 focus-visible:ring-solar-500 grid grid-cols-[auto_1fr_auto] items-center gap-4 rounded-2xl border
border-white/20 p-4 focus-visible:ring-2 focus-visible:outline focus-visible:outline-transparent"
			>
				<div class="bg-mine-900/60 rounded-full p-3">
					{#if walletType.icon}
						{@const Component = walletType.icon}
						<Component class="size-6 group-hover:stroke-sky-500" />
					{/if}
				</div>
				<div class="space-y-1">
					<h4 class="text-xl font-semibold">
						{walletType.title}
					</h4>
					<p>{walletType.description}</p>
				</div>
				<ChevronRight class="size-6 group-hover:stroke-sky-500" />
			</a>
		{/each}
	</Stack>
	<Button variant="secondary" href="/{data.network}/signup">Back</Button>
</Stack>

<Stack class="gap-2">
	<h3 class="h3">Why do I need a wallet?</h3>
	<p>
		A wallet is your gateway to the blockchain, allowing you to manage your digital assets and
		interact with decentralized applications.
	</p>
</Stack>
