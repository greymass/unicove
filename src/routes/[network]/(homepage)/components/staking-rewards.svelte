<script lang="ts">
	import Stack from '$lib/components/layout/stack.svelte';
	import type { NetworkState } from '$lib/state/network.svelte';
	import Button from './homepage-button.svelte';
	import StakedHEX from './stakedhex.svelte';
	import { getAPR } from '$lib/utils/staking';
	import Switcher from '$lib/components/layout/switcher.svelte';

	interface Props {
		network: NetworkState;
	}

	let { network }: Props = $props();

	const apr = $derived(getAPR(network));
</script>

<section class="col-span-full xl:col-start-2">
	<Switcher class="flex-wrap-reverse gap-y-12" threshold="40rem">
		<!-- Text -->
		<div class="col-span-full">
			<Stack class="max-w-md items-start">
				<h2 class="h3 leading-tight">EOS Staking Rewards</h2>
				<p>
					Stake {network.chain.systemToken?.symbol.name} today for an estimated {apr}% APR<sup
						>1</sup
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
		<div class="col-span-full grid place-items-center">
			{#if network.rexstate}
				<StakedHEX staked={network.rexstate.total_lendable} {apr} />
			{/if}
		</div>
	</Switcher>
</section>
