<script lang="ts">
	import Stack from '$lib/components/layout/stack.svelte';
	import type { NetworkState } from '$lib/state/network.svelte';
	import Button from './homepage-button.svelte';
	import StakedHEX from './stakedhex.svelte';
	import { getAPR } from '$lib/utils/staking';
	import Switcher from '$lib/components/layout/switcher.svelte';
	import Box from '$lib/components/layout/box/box.svelte';
	import * as m from '$lib/paraglide/messages';

	interface Props {
		network: NetworkState;
	}

	let { network }: Props = $props();

	const apr = $derived(getAPR(network));
</script>

<section class="col-span-full">
	<Switcher class="flex-wrap-reverse gap-y-12" threshold="40rem">
		<!-- Text -->
		<Box class="col-span-full">
			<Stack class="max-w-md items-start">
				<h2 class="h3 leading-tight">{network.chain.name} {m.common_staking_rewards()}</h2>
				<p>
					{m.homepage_staking_intro({
						network: network.chain.name,
						apr
					})}<sup>1</sup>.
				</p>
				<p>
					{m.homepage_staking_description({
						network: network.chain.name,
						token: network.chain.systemToken?.symbol.name
					})}
				</p>
				<div class="mt-2 flex gap-6">
					<Button
						class="border border-mineShaft-600 px-6"
						href={`/${network}/staking`}
						text={m.common_stake_action()}
					/>
					<Button href="https://eosnetwork.com/staking-rewards/" text="Learn more" icon />
				</div>
				<p class="text-muted text-xs">
					<sup>1</sup>
					{m.homepage_staking_intro_legend()}
				</p>
			</Stack>
		</Box>

		<!-- Graphics -->
		<div class="col-span-full grid place-items-center">
			{#if network.rexstate}
				<StakedHEX staked={network.rexstate.total_lendable} {apr} />
			{/if}
		</div>
	</Switcher>
</section>
