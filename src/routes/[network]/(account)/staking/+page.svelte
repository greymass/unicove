<script lang="ts">
	import { Asset } from '@wharfkit/antelope';
	import { getContext } from 'svelte';

	import { Card, Stack, Switcher } from '$lib/components/layout';
	import Button from '$lib/components/button/button.svelte';
	import AssetText from '$lib/components/elements/asset.svelte';
	import type { UnicoveContext } from '$lib/state/client.svelte';
	import type { UnstakingRecord } from '$lib/utils/staking';
	import {
		getClaimableBalance,
		getWithdrawableBalance,
		getStakedBalance,
		getUnstakingBalances,
		getAPR
	} from '$lib/utils/staking';
	import UnstakingBalances from '$lib/components/elements/unstaking.svelte';
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

	let apr = $derived(getAPR(data.network));
	let usdValue = $derived(
		Asset.from(
			staked.value * (data.network.tokenprice ? data.network.tokenprice.value : 0),
			'2,USD'
		)
	);
</script>

<div class="gap-6 *:mb-6 *:inline-block *:w-full last:*:mb-0 @2xl:columns-2">
	<div>
		<Card class="gap-6" title="Staked - {apr}% APR">
			<Switcher threshold="30ch">
				<div>
					<p>Staked {context.network?.chain.name}</p>
					<AssetText class="text-xl text-white" variant="value" value={staked} />
					<!-- TODO: Chip for percent staked -->
				</div>

				<div>
					<p>USD Value</p>
					<p class="text-xl text-white">
						<AssetText variant="value" value={usdValue} />
					</p>
					<!-- TODO: Chip for percent change -->
				</div>
			</Switcher>

			<Switcher threshold="30ch">
				<Button href="/{networkName}/staking/stake" variant="secondary">Stake</Button>
				<Button href="/{networkName}/staking/unstake" variant="secondary">Unstake</Button>
			</Switcher>
		</Card>
	</div>

	<UnstakingBalances records={unstaking} />

	<div>
		<Card class="gap-6" title="Withdrawable">
			<div>
				<p class="caption">Currently Withdrawable</p>

				<AssetText class="text-xl text-white" variant="full" value={totalWithdraw} />
			</div>
			<Button href="/{networkName}/staking/withdraw" variant="secondary">Withdraw</Button>
		</Card>
	</div>

	<div>
		<StakingCalculator
			{apr}
			network={data.network}
			tokenprice={data.network.tokenprice || Asset.from(0, '2,USD')}
		/>
	</div>

	<div>
		<Card class="hidden gap-5" title="About staking">
			<Stack class="gap-5">
				<p class="caption">
					The APR is an estimate, and may fluctuate based on how many and much others are staking.
					Your 21 day lockup period starts when you unstake your EOS.
				</p>
				<p class="caption">You will never get back less EOS.</p>

				<p class="caption">
					Unstaking balances will still accrue rewards until they are claimed. However, any
					operation you do (staking more for instance) will automatically claim your fully unstaked
					positions.
				</p>
			</Stack>
		</Card>
	</div>
</div>
