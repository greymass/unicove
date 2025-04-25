<script lang="ts">
	import Stack from '$lib/components/layout/stack.svelte';
	import type { NetworkState } from '$lib/state/network.svelte';
	import StakedHEX from './stakedhex.svelte';
	import { getAPR } from '$lib/utils/staking';
	import Switcher from '$lib/components/layout/switcher.svelte';
	import Box from '$lib/components/layout/box/box.svelte';
	import * as m from '$lib/paraglide/messages';
	import Button from '$lib/components/button/button.svelte';
	import { ArrowRight } from 'lucide-svelte';

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
				<h2 class="h3 leading-tight">{network.token.name} {m.common_staking_rewards()}</h2>
				<p>
					{m.homepage_staking_intro({
						token: network.token.name,
						apr
					})}<sup>1</sup>.
				</p>
				<p>
					{m.homepage_staking_description({
						network: network.token.name,
						token: String(network.chain.systemToken?.symbol.name)
					})}
				</p>
				<div class="mt-2 flex items-center gap-6">
					<Button variant="secondary" href={`/${network}/staking`}>
						{m.common_stake_action()}
					</Button>
					<Button variant="tertiary" href="https://eosnetwork.com/staking-rewards/">
						<span class="flex items-center gap-2">
							Learn more <ArrowRight class="size-4" />
						</span>
					</Button>
				</div>
				<p class="text-muted text-xs">
					<sup>1</sup>
					{m.homepage_staking_intro_legend()}
				</p>
			</Stack>
		</Box>

		{#if network.token.distribution}
			<!-- Graphics -->
			<div class="col-span-full grid place-items-center">
				<StakedHEX staked={network.token.distribution.staked} {apr} />
			</div>
		{/if}
	</Switcher>
</section>
