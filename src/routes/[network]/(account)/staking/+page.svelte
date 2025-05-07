<script lang="ts">
	import { Asset } from '@wharfkit/antelope';
	import { getContext } from 'svelte';
	import { ChartLine } from 'lucide-svelte';

	import { Card, MultiCard, Stack } from '$lib/components/layout';
	import AssetText from '$lib/components/elements/asset.svelte';
	import type { MarketContext, UnicoveContext } from '$lib/state/client.svelte';
	import type { UnstakingRecord } from '$lib/utils/staking';
	import {
		getClaimableBalance,
		getWithdrawableBalance,
		getStakedBalance,
		getUnstakingBalances,
		getAPR,
		getUnstakableBalance,
		getUnstakableREX,
		getUnstakingRex
	} from '$lib/utils/staking';
	import UnstakingBalances from '$lib/components/elements/unstaking.svelte';
	import AccountBalance from '$lib/components/card/accountbalance.svelte';
	import StakingCalculator from './stakingcalculator.svelte';
	import Cluster from '$lib/components/layout/cluster.svelte';
	import Chip from '$lib/components/chip.svelte';
	import * as m from '$lib/paraglide/messages';
	import { Currencies } from '$lib/types/currencies';
	import { ZeroUnits } from '$lib/types/token';

	const context = getContext<UnicoveContext>('state');
	const market = getContext<MarketContext>('market');

	const { data } = $props();
	const networkName = String(data.network);

	let total: Asset = $derived(getStakedBalance(data.network, context.account));
	let staked: Asset = $derived(getUnstakableBalance(data.network, context.account));
	let stakedRex: Asset = $derived(getUnstakableREX(data.network, context.account));
	let unstaking: Array<UnstakingRecord> = $derived(
		getUnstakingBalances(data.network, context.account)
	);
	let unstakingRex: Asset = $derived(getUnstakingRex(data.network, context.account));
	let unstakingTotal: Asset = $derived(
		unstaking
			.filter((r) => !r.savings)
			.reduce(
				(acc, record) => {
					if (!record.claimable) {
						acc.units.add(record.balance.units);
					}
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

	let apr = $derived(getAPR(data.network.token.distribution?.staked));

	let activity = $derived(
		staked.units.gt(ZeroUnits) ||
			unstakingTotal.units.gt(ZeroUnits) ||
			totalWithdraw.units.gt(ZeroUnits)
	);

	const currency = $derived(Currencies[context.settings.data.displayCurrency]);
	let currencyValue = $derived(
		market.account ? market.account.systemtoken.staked : Asset.fromUnits(0, currency.symbol)
	);
</script>

{#snippet tableAction([text, href]: string[])}
	<td class="text-right">
		<a class="text-primary hover:text-primary-container" {href}>{text}</a>
	</td>
{/snippet}

{#if data.network.supports('staking')}
	<MultiCard>
		<Card id="account-value" style="column-span: all;">
			<Cluster class="items-center">
				<picture class="bg-surface-container-high grid size-12 place-items-center rounded-full">
					<ChartLine />
				</picture>
				<div>
					<p>{m.common_apr_current()}</p>
					<p class="text-on-surface text-2xl font-bold">{apr}%</p>
				</div>
			</Cluster>
		</Card>
		<Card
			id="token"
			title={m.common_labeled_unit_balance({
				unit: m.common_staking()
			})}
		>
			<Stack>
				<Stack class="gap-2">
					<h4 class="text-muted text-base leading-none capitalize">
						{m.common_labeled_unit_staked({
							unit: m.common_tokens()
						})}
					</h4>
					<p class="text-on-surface text-xl leading-none font-semibold">
						<AssetText variant="full" value={total} />
					</p>
					<Chip>
						<AssetText variant="full" value={currencyValue} />
						<!-- TODO: Percent change -->
					</Chip>
				</Stack>

				{#if activity}
					<Stack class="gap-2">
						<table class="table-styles text-muted">
							<tbody>
								{#if staked.units.gt(ZeroUnits)}
									<tr>
										<td>{m.common_staked()}</td>
										<td class="text-on-surface text-right">
											{#if staked.units.equals(0)}
												<span class="font-mono">&lt;</span>
											{/if}
											<AssetText variant="full" value={staked} />
											{#if context.settings.data.advancedMode}
												<p>
													<AssetText variant="full" value={stakedRex} />
												</p>
											{/if}
										</td>
										{@render tableAction([m.common_unstake(), `/${data.network}/staking/unstake`])}
									</tr>
								{/if}
								{#if unstakingTotal.units.gt(ZeroUnits)}
									<tr>
										<td>{m.common_unstaking()}</td>
										<td class="text-on-surface text-right">
											<AssetText variant="full" value={unstakingTotal} />
											{#if context.settings.data.advancedMode}
												<p>
													<AssetText variant="full" value={unstakingRex} />
												</p>
											{/if}
										</td>
										<td></td>
									</tr>
								{/if}
								{#if totalWithdraw.units.gt(ZeroUnits)}
									<tr>
										<td>{m.common_unstaked()}</td>
										<td class="text-on-surface text-right">
											<AssetText variant="full" value={totalWithdraw} />
											{#if context.settings.data.advancedMode}
												<p>
													<AssetText variant="full" value={unstakingRex} />
												</p>
											{/if}
										</td>
										{@render tableAction([
											m.common_withdraw(),
											`/${data.network}/staking/withdraw`
										])}
									</tr>
								{/if}
							</tbody>
						</table>
					</Stack>
				{/if}
			</Stack>
		</Card>
		<AccountBalance cta={{ href: `/${networkName}/staking/stake`, label: m.common_stake() }} />
		<UnstakingBalances records={unstaking} />
		<StakingCalculator {apr} network={data.network} tokenprice={market.network.systemtoken.price} />
	</MultiCard>
{:else}
	<p>
		{m.common_staking_unavailable_network({
			network: data.network.chain.name
		})}
	</p>
{/if}
