<script lang="ts">
	import Card from '$lib/components/layout/box/card.svelte';
	import Stack from '$lib/components/layout/stack.svelte';
	import Grid from '$lib/components/layout/grid.svelte';
	import AssetText from '$lib/components/elements/asset.svelte';

	import { Asset } from '@wharfkit/antelope';
	import type { UnicoveContext } from '$lib/state/client.svelte';
	import { getContext } from 'svelte';

	const { data } = $props();

	const context = getContext<UnicoveContext>('state');

	const isCurrentUser = context.account && data.account.name.equals(context.account.name);
</script>

{#if data.account}
	<Stack class="gap-2">
		<Card>
			<div class="flex items-center gap-5">
				<div class="flex h-14 w-14 items-center justify-center rounded-full bg-[#303338]">
					<span class="text-3xl font-light">$</span>
				</div>
				<Stack class="gap-2">
					<p>Total Account Value</p>
					<AssetText class="h3" value={data.account.value?.total} />
				</Stack>
			</div>
		</Card>
		<Grid class="grid-cols-5">
			<Stack class="col-span-3">
				<Card>
					<Stack>
						<h3 class="h3">EOS</h3>
						<h3 class="h4">Value</h3>
						<div>
							$ <AssetText value={data.account.value.total} />
						</div>
						<div>
							<AssetText value={data.network.tokenprice} /> EOS/USD
						</div>
						<h3 class="h4">Breakdown</h3>
						<table class="table-styles">
							<tbody>
								<tr>
									<td>Available</td>
									<td><AssetText value={data.account.balance.liquid} /></td>
									{#if isCurrentUser}
										<td>
											<a href={`/{data.network.chain}/send`}>Send</a>
										</td>
									{/if}
								</tr>
								<tr>
									<td>Staked</td>
									<td><AssetText value={data.account.balance.staked} /></td>
									{#if isCurrentUser}
										<td>
											<a href={`/{data.network.chain}/staking`}>Staking</a>
										</td>
									{/if}
								</tr>
								<tr>
									<td>Delegated</td>
									<td><AssetText value={data.account.balance.delegated} /></td>
									{#if isCurrentUser}
										<td></td>
									{/if}
								</tr>
								<tr>
									<td>Total</td>
									<td><AssetText value={data.account.balance.total} /></td>
									{#if isCurrentUser}
										<td></td>
									{/if}
								</tr>
							</tbody>
						</table>
					</Stack>
				</Card>
				<Card>
					<Stack>
						<h3 class="h3">RAM</h3>
						<h3 class="h4">Value</h3>
						<div>
							$ <AssetText value={data.account.value.ram} />
						</div>
						<div>
							<AssetText value={data.network.ramprice.usd} /> RAM/USD
						</div>
						<h3 class="h4">Breakdown</h3>
						<table class="table-styles">
							<tbody>
								<tr>
									<td>Available</td>
									<td
										><AssetText value={Asset.fromUnits(data.account.ram.available, '3,KB')} /> KB</td
									>
									{#if isCurrentUser}
										<td>
											<a href={`/{data.network.chain}/ram`}>RAM Market</a>
										</td>
									{/if}
								</tr>
								<tr>
									<td>Used</td>
									<td><AssetText value={Asset.fromUnits(data.account.ram.used, '3,KB')} /> KB</td>
									{#if isCurrentUser}
										<td></td>
									{/if}
								</tr>
								<tr>
									<td>Total</td>
									<td><AssetText value={Asset.fromUnits(data.account.ram.max, '3,KB')} /> KB</td>
									{#if isCurrentUser}
										<td></td>
									{/if}
								</tr>
							</tbody>
						</table>
					</Stack>
				</Card>
			</Stack>
			<Stack class="col-span-2">
				<Card>
					<h3 class="h3">Distribution</h3>
				</Card>
				<Card>
					<h3 class="h3">Resources</h3>
				</Card>
			</Stack>
		</Grid>
	</Stack>
{/if}
