<script lang="ts">
	import * as m from '$lib/paraglide/messages.js';
	import { Box, Card, Center, Stack, Switcher } from '$lib/components/layout';
	import PageHeader from '$lib/components/pageheader.svelte';
	import Button from '$lib/components/button/button.svelte';
	import type { UnicoveContext } from '$lib/state/client.svelte';
	import { Asset } from '@wharfkit/antelope';
	import { getContext } from 'svelte';

	import type { UnstakingRecord } from './utils';
	import { getStakedBalance, getUnstakingBalances, getAPY } from './utils';
	import UnstakingBalances from './unstaking.svelte';

	const context = getContext<UnicoveContext>('state');
	const { data } = $props();
	const networkName = String(data.network);

	let staked: Asset = $derived(
		context.account ? getStakedBalance(data.network, context.account) : Asset.from(0, '0,UNKNOWN')
	);
	let unstaking: Array<UnstakingRecord> = $derived(
		context.account ? getUnstakingBalances(data.network, context.account) : []
	);
	let apy = $derived(getAPY(data.network));
	let usdValue = $derived(
		Asset.from(
			staked.value * (data.network.tokenprice ? data.network.tokenprice.value : 0),
			'4,USD'
		)
	);
</script>

<Stack class="mx-auto max-w-5xl gap-8">
	<Switcher threshold="40rem" class="items-start justify-center">
		<Card class="gap-5">
			<Stack class="gap-0">
				<p class="caption">Currently Staked - {apy}% APY</p>
				<p class="h3">{staked}</p>
				<p class="mt-1.5 self-start rounded bg-shark-800/60 px-2">
					${usdValue}
				</p>
			</Stack>
			<Switcher threshold="20rem">
				<Button href="/{networkName}/staking/stake" variant="secondary" class="text-skyBlue-500"
					>Stake</Button
				>
				<Button href="/{networkName}/staking/unstake" variant="secondary" class="text-skyBlue-500"
					>Unstake</Button
				>
			</Switcher>
		</Card>
		<UnstakingBalances href="/{networkName}/staking/withdraw" records={unstaking} />
	</Switcher>
	<Card class="gap-5">
		<Stack class="gap-0">
			<p class="caption">Staking yield history</p>
			<p class="h3">0.0 EOS</p>
		</Stack>
	</Card>
</Stack>
