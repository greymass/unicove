<script lang="ts">
	import { Card, Stack, Switcher } from '$lib/components/layout';
	import Button from '$lib/components/button/button.svelte';
	import AssetText from '$lib/components/elements/asset.svelte';
	import type { UnicoveContext } from '$lib/state/client.svelte';
	import { Asset } from '@wharfkit/antelope';
	import { getContext } from 'svelte';

	import type { UnstakingRecord } from './utils';
	import {
		getClaimableBalance,
		getWithdrawableBalance,
		getStakedBalance,
		getUnstakingBalances,
		getAPY
	} from './utils';
	import UnstakingBalances from './unstaking.svelte';
	import StakingCalculator from './stakingcalculator.svelte';

	const context = getContext<UnicoveContext>('state');
	const { data } = $props();
	const networkName = String(data.network);

	let staked: Asset = $derived(getStakedBalance(data.network, context.account));
	let unstaking: Array<UnstakingRecord> = $derived(
		getUnstakingBalances(data.network, context.account)
	);
	let claimable: Asset = $derived(getClaimableBalance(data.network, context.account, unstaking));
	let withdrawable: Asset = $derived(getWithdrawableBalance(data.network, context.account));
	let totalWithdraw: Asset = $derived(
		Asset.fromUnits(
			claimable.units.adding(withdrawable.units),
			data.network.chain.systemToken!.symbol
		)
	);

	let apy = $derived(getAPY(data.network));
	let usdValue = $derived(
		Asset.from(
			staked.value * (data.network.tokenprice ? data.network.tokenprice.value : 0),
			'2,USD'
		)
	);
</script>

<Switcher threshold="64rem" class="place-content-between">
	<Stack class="max-w-lg gap-9">
		<Card class="gap-5" title="Staked - {apy}% APY">
			<Switcher threshold="20rem">
				<Stack class="text-md gap-0">
					<p class="caption">Currently Staked</p>
					<p class="mt-1.5 self-start rounded bg-shark-800/60 px-2 text-white">
						<AssetText class="text-white" variant="full" value={staked} />
					</p>
				</Stack>
				<Stack class="text-md gap-0">
					<p class="caption">USD Value</p>
					<p class="mt-1.5 self-start rounded bg-shark-800/60 px-2 text-white">
						$<AssetText variant="value" value={usdValue} />
					</p>
				</Stack>
			</Switcher>
			<Switcher threshold="20rem">
				<Button href="/{networkName}/staking/stake" variant="secondary" class="text-skyBlue-500"
					>Stake</Button
				>
				<Button href="/{networkName}/staking/unstake" variant="secondary" class="text-skyBlue-500"
					>Unstake</Button
				>
			</Switcher>
		</Card>
		<UnstakingBalances records={unstaking} />
		<Card class="gap-5" title="Withdrawable">
			<Stack class="text-md gap-0">
				<p class="caption">Currently Withdrawable</p>
				<p class="mt-1.5 self-start rounded bg-shark-800/60 px-2 text-white">
					<AssetText class="text-white" variant="full" value={totalWithdraw} />
				</p>
			</Stack>
			<Button href="/{networkName}/staking/withdraw" variant="secondary" class="text-skyBlue-500"
				>Withdraw</Button
			>
		</Card>
	</Stack>
	<Stack class="max-w-lg gap-4">
		<StakingCalculator {apy} network={data.network} tokenprice={data.network.tokenprice} />
		<Card class="gap-5" title="About staking">
			<Stack class="gap-5">
				<p class="caption">
					Unstaking balances will still accrue rewards until they are claimed. However, any
					operation you do (staking more for instance) will automatically claim your fully unstaked
					positions.
				</p>
			</Stack>
		</Card>
	</Stack>
</Switcher>
