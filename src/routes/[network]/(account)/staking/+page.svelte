<script lang="ts">
	import { Asset, UInt64 } from '@wharfkit/antelope';
	import { getContext } from 'svelte';
	import { ChartLine } from 'lucide-svelte';

	import { Card, MultiCard, Stack } from '$lib/components/layout';
	import AssetText from '$lib/components/elements/asset.svelte';
	import type { UnicoveContext } from '$lib/state/client.svelte';
	import type { UnstakingRecord } from '$lib/utils/staking';
	import {
		getClaimableBalance,
		getWithdrawableBalance,
		getStakedBalance,
		getUnstakingBalances,
		getAPR,
		getStakableBalance,
		getUnstakableBalance
	} from '$lib/utils/staking';
	import UnstakingBalances from '$lib/components/elements/unstaking.svelte';
	import AccountBalance from '$lib/components/card/accountbalance.svelte';
	import StakingCalculator from './stakingcalculator.svelte';
	import Cluster from '$lib/components/layout/cluster.svelte';
	import Chip from '$lib/components/chip.svelte';

	const context = getContext<UnicoveContext>('state');
	const { data } = $props();
	const networkName = String(data.network);

	let available: Asset = $derived(getStakableBalance(data.network, context.account));
	let total: Asset = $derived(getStakedBalance(data.network, context.account));
	let staked: Asset = $derived(getUnstakableBalance(data.network, context.account));
	let unstaking: Array<UnstakingRecord> = $derived(
		getUnstakingBalances(data.network, context.account)
	);
	let unstakingTotal: Asset = $derived(
		unstaking
			.filter((r) => !r.savings)
			.reduce(
				(acc, record) => {
					acc.units.add(record.balance.units);
					return acc;
				},
				Asset.fromUnits(0, data.network.chain.systemToken!.symbol) as Asset
			)
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
		Asset.from(total.value * (data.network.tokenprice ? data.network.tokenprice.value : 0), '2,USD')
	);
	let usdValueAvailable = $derived(
		Asset.from(
			available.value * (data.network.tokenprice ? data.network.tokenprice.value : 0),
			'2,USD'
		)
	);

	let activity = $derived(
		staked.units.gt(UInt64.from(0)) ||
			unstakingTotal.units.gt(UInt64.from(0)) ||
			totalWithdraw.units.gt(UInt64.from(0))
	);
</script>

{#snippet tableAction([text, href]: string[])}
	<td class="text-right">
		<a class="text-skyBlue-500 hover:text-skyBlue-400" {href}>{text}</a>
	</td>
{/snippet}

<MultiCard>
	<Card id="account-value" style="column-span: all;">
		<Cluster class="items-center">
			<picture class="grid size-12 place-items-center rounded-full bg-mineShaft-900">
				<ChartLine />
			</picture>
			<div>
				<p>Current APR</p>
				<p class="text-2xl font-bold text-white">{apr}%</p>
			</div>
		</Cluster>
	</Card>
	<Card id="token" title="Staking Balance">
		<Stack>
			<Stack class="gap-2">
				<h4 class="text-muted text-base leading-none">Tokens Staked</h4>
				<p class="text-xl font-semibold leading-none text-white">
					<AssetText variant="full" value={total} />
				</p>
				<Chip>
					<AssetText variant="full" value={usdValue} />
					<!-- TODO: Percent change -->
				</Chip>
			</Stack>

			{#if activity}
				<Stack class="gap-2">
					<table class="table-styles text-muted">
						<tbody>
							{#if staked.units.gt(UInt64.from(0))}
								<tr>
									<td>Staked</td>
									<td class="text-right text-white">
										<AssetText variant="full" value={staked} />
									</td>
									{@render tableAction(['Unstake', `/${data.network}/staking/unstake`])}
								</tr>
							{/if}
							{#if unstakingTotal.units.gt(UInt64.from(0))}
								<tr>
									<td>Unstaking</td>
									<td class="text-right text-white">
										<AssetText variant="full" value={unstakingTotal} />
									</td>
									<td></td>
								</tr>
							{/if}
							{#if totalWithdraw.units.gt(UInt64.from(0))}
								<tr>
									<td>Unstaked</td>
									<td class="text-right text-white">
										<AssetText variant="full" value={totalWithdraw} />
									</td>
									{@render tableAction(['Withdraw', `/${data.network}/staking/withdraw`])}
								</tr>
							{/if}
						</tbody>
					</table>
				</Stack>
			{/if}
		</Stack>
	</Card>
	<AccountBalance
		title="Account Balance"
		cta={{ href: `/${networkName}/staking/stake`, label: 'Stake' }}
	/>
	<StakingCalculator
		{apr}
		network={data.network}
		tokenprice={data.network.tokenprice || Asset.from(0, '2,USD')}
	/>
	<UnstakingBalances records={unstaking} />
</MultiCard>

<div class="gap-6 *:mb-6 *:inline-block *:w-full last:*:mb-0 @2xl:columns-2">
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
