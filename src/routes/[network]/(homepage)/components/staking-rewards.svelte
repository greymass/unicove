<script lang="ts">
	import Stack from '$lib/components/layout/stack.svelte';
	import type { NetworkState } from '$lib/state/network.svelte';
	import Button from './homepage-button.svelte';
	import StakedHEX from './stakedhex.svelte';
	import { getAPR } from '$lib/utils/staking';

	interface Props {
		network: NetworkState;
	}

	let { network }: Props = $props();

	const apr = $derived(getAPR(network));
</script>

<section class="col-span-full grid grid-cols-subgrid gap-8">
	<!-- Text -->
	<div
		class="z-20 col-span-full row-start-1 max-w-md place-self-center justify-self-start text-balance xs:col-span-1 sm:col-span-full sm:justify-self-auto md:row-span-2 md:row-start-1 md:max-w-md lg:col-span-4 lg:row-auto lg:content-center"
	>
		<Stack class="max-w-md items-start pl-8">
			<h3 class="h3 leading-tight">EOS Staking Rewards</h3>
			<p>
				Stake {network.chain.systemToken?.symbol.name} today for an estimated {apr}% APR<sup>1</sup
				>.
			</p>
			<p>
				The {network.chain.name} staking rewards program proportionally distributes 85.6k {network
					.chain.systemToken?.symbol.name} daily to token holders who have staked their tokens. These
				tokens can be unstaked and will be usable against after a 21 day lockup period.
			</p>
			<div class="flex gap-2">
				<Button href={`/${network}/staking`} text="Stake Tokens" />
				<Button href="#" text="Learn more" />
			</div>
			<p class="text-muted text-xs">
				<sup>1</sup> APR is based on the total amount staked and dynamically changes over time.
			</p>
		</Stack>
	</div>

	<!-- Graphics -->
	<div
		class="col-span-full grid place-items-center xs:col-start-3 xs:row-start-1 md:col-start-5 md:row-span-2 md:row-start-2 lg:row-auto"
	>
		{#if network.rexstate}
			<StakedHEX staked={network.rexstate.total_lendable} {apr} />
		{/if}
	</div>
</section>
