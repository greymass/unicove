<script lang="ts">
	import Card from '$lib/components/layout/box/card.svelte';
	import Stack from '$lib/components/layout/stack.svelte';
	import Grid from '$lib/components/layout/grid.svelte';
	import AssetText from '$lib/components/elements/asset.svelte';

	import { Asset } from '@wharfkit/antelope';
	import type { UnicoveContext } from '$lib/state/client.svelte';
	import { getContext } from 'svelte';
	import DollarSign from 'lucide-svelte/icons/dollar-sign';
	import TradingPair from '$lib/components/elements/tradingpair.svelte';
	import Chip from '$lib/components/chip.svelte';

	const { data } = $props();

	const context = getContext<UnicoveContext>('state');

	const isCurrentUser = $derived(
		context.account &&
			context.account.name &&
			data.account &&
			data.account.name &&
			data.account.name.equals(context.account.name)
	);
</script>

{#snippet tableAction([text, href]: string[])}
	<td class="text-right">
		<a class="text-skyBlue-500 hover:text-skyBlue-400" {href}>{text}</a>
	</td>
{/snippet}

<!-- What gets shown on this page if data.account doesn't exist? -->
{#if data.account}
	<Stack>
		<Card id="account-value" class="flex items-center">
			<picture class="grid size-12 place-items-center rounded-full bg-mineShaft-900">
				<DollarSign />
			</picture>
			<div>
				<p>Total Account Value</p>
				<AssetText
					class="text-2xl font-bold text-white"
					variant="full"
					value={data.account.value?.total}
				/>
			</div>
		</Card>

		<Grid class="grid-cols-5">
			<Stack class="col-span-3">
				<Card id="eos" title="EOS">
					<Stack>
						<Stack class="gap-2">
							<h4 class="text-muted text-base leading-none">Value</h4>
							<p class="text-xl font-semibold leading-none text-white">
								<AssetText variant="full" value={data.account.value?.systemtoken} />
							</p>
							<Chip>
								<TradingPair value={data.network.tokenprice} />
								<!-- TODO: Percent change -->
							</Chip>
						</Stack>

						<Stack class="gap-2">
							<h5 class="h5">Breakdown</h5>
							<table class="table-styles text-muted">
								<tbody>
									<tr>
										<td>Available</td>
										<td class="text-right text-white"
											><AssetText variant="full" value={data.account.balance?.liquid} /></td
										>
										{#if isCurrentUser}
											{@render tableAction(['Send', `/${data.network}/send`])}
										{/if}
									</tr>
									<tr>
										<td>Staked</td>
										<td class="text-right text-white"
											><AssetText variant="full" value={data.account.balance?.staked} /></td
										>
										{#if isCurrentUser}
											{@render tableAction(['Staking', `/${data.network}/staking`])}
										{/if}
									</tr>
									<tr>
										<td>Delegated</td>
										<td class="text-right text-white"
											><AssetText variant="full" value={data.account.balance?.delegated} /></td
										>
										{#if isCurrentUser}
											<td></td>
										{/if}
									</tr>
									<tr>
										<td>Total</td>
										<td class="text-right text-white">
											<AssetText variant="full" value={data.account.balance?.total} />
										</td>
										{#if isCurrentUser}
											<td></td>
										{/if}
									</tr>
								</tbody>
							</table>
						</Stack>
					</Stack>
				</Card>

				<Card id="ram" title="RAM">
					<Stack>
						<Stack class="gap-2">
							<h4 class="text-muted text-base leading-none">Value</h4>
							<p class="text-xl font-semibold leading-none text-white">
								<AssetText variant="full" value={data.account.value?.ram} />
							</p>
							<Chip>
								<!-- TODO: Get TradingPair working with RAM  -->
								<span>
									<AssetText value={data.network.ramprice?.usd} /> RAM/USD
								</span>
								<!-- TODO: Percent change -->
							</Chip>
						</Stack>

						<Stack class="gap-2">
							<h5 class="h5">Breakdown</h5>
							<table class="table-styles text-muted">
								<tbody>
									<tr>
										<td>Available</td>
										<td class="text-right text-white"
											><AssetText value={Asset.fromUnits(data.account.ram?.available, '3,KB')} /> KB</td
										>
										{#if isCurrentUser}
											{@render tableAction(['RAM Market', `/${data.network}/ram`])}
										{/if}
									</tr>
									<tr>
										<td>Used</td>
										<td class="text-right text-white"
											><AssetText value={Asset.fromUnits(data.account.ram?.used, '3,KB')} /> KB</td
										>
										{#if isCurrentUser}
											<td></td>
										{/if}
									</tr>
									<tr>
										<td>Total</td>
										<td class="text-right text-white"
											><AssetText value={Asset.fromUnits(data.account.ram?.max, '3,KB')} /> KB</td
										>
										{#if isCurrentUser}
											<td></td>
										{/if}
									</tr>
								</tbody>
							</table>
						</Stack>
					</Stack>
				</Card>
			</Stack>

			<Stack class="col-span-2">
				<Card title="Distribution">
					<div></div>
				</Card>

				<Card title="Resources">
					<div></div>
				</Card>
			</Stack>
		</Grid>
	</Stack>
{/if}
