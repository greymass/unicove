<script lang="ts" context="module">
	import type { WalletType } from '../walletTypes';
	export type WalletButtonProps = {
		network: string;
		wallet: WalletType;
	};
</script>

<script lang="ts">
	import { ChevronRight } from 'lucide-svelte';

	let { network, wallet }: WalletButtonProps = $props();
</script>

<a
	href="/{network}/signup/wallets/{wallet.type}"
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
