<script lang="ts">
	import PillGroup from '$lib/components/navigation/pillgroup.svelte';
	import { page } from '$app/stores';
	import Pageheader from '$lib/components/pageheader.svelte';
	import Stack from '$lib/components/layout/stack.svelte';
	import Button from '$lib/components/button/button.svelte';
	import { walletTypes } from './walletTypes';

	const { data } = $props();
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

	<div class="container mx-auto p-4">
		<h2 class="mb-4 text-xl font-semibold">Choose A Wallet Type</h2>
		<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
			{#each Object.entries(walletTypes) as [walletType, value]}
				<div class="flex justify-center">
					<Button href="/{data.network}/signup/wallet-type/{walletType}" class="w-full">
						{value.title}
					</Button>
				</div>
			{/each}
		</div>
	</div>
</Stack>
