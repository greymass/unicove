<script lang="ts">
	import Stack from '$lib/components/layout/stack.svelte';
	import type { NetworkState } from '$lib/state/network.svelte';
	import StakedHEX from './stakedhex.svelte';
	import { getAPR } from '$lib/utils/staking';
	import * as m from '$lib/paraglide/messages';
	import Button from '$lib/components/button/button.svelte';

	interface Props {
		network: NetworkState;
	}

	let { network }: Props = $props();

	const apr = $derived(getAPR(network.token.distribution?.staked));
</script>

<section class="@container grid gap-y-12">
	{#if network.token.distribution}
		<!-- Graphics -->
		<div class="row-start-1 grid place-items-center @3xl:col-start-2">
			<StakedHEX staked={network.token.distribution.staked} {apr} />
		</div>
	{/if}

	<!-- Text -->
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
			<Button variant="text" href="https://eosnetwork.com/staking-rewards/">Learn more</Button>
		</div>
		<p class="text-muted text-xs">
			<sup>1</sup>
			{m.homepage_staking_intro_legend()}
		</p>
	</Stack>
</section>
