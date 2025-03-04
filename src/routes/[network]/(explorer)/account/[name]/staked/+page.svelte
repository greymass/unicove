<script lang="ts">
	import { Asset } from '@wharfkit/antelope';
	import { Card, Stack, Switcher } from '$lib/components/layout';
	import type { UnstakingRecord } from '$lib/utils/staking';
	import {
		getStakedBalance,
		getClaimableBalance,
		getWithdrawableBalance,
		getUnstakingBalances,
		getUnstakableBalance,
		getAPR
	} from '$lib/utils/staking';

	import UnstakingBalances from '$lib/components/elements/unstaking.svelte';
	import type { MarketContext, UnicoveContext } from '$lib/state/client.svelte.js';
	import { getContext } from 'svelte';

	const context = getContext<UnicoveContext>('state');
	const { network } = getContext<MarketContext>('value');

	const { data } = $props();

	let staked: Asset = $derived(getStakedBalance(data.network, data.account));
	let claimable: Asset = $derived(getClaimableBalance(data.network, data.account));
	let withdrawable: Asset = $derived(getWithdrawableBalance(data.network, data.account));
	let unstaking: Array<UnstakingRecord> = $derived(
		getUnstakingBalances(data.network, data.account)
	);
	let unstakable: Asset = $derived(getUnstakableBalance(data.network, data.account, unstaking));
	let apr: string = $derived(getAPR(data.network));
	let usdValue = $derived(
		Asset.from(
			staked.value * (network.systemtoken.price ? network.systemtoken.price.value : 0),
			'2,USD'
		)
	);
</script>

<Stack>
	{#if data.account}
		<Stack>
			<Switcher threshold="64rem" class="place-content-between">
				<Card class="gap-5" title="Staked">
					<table class="table-styles">
						<tbody>
							<tr>
								<td>Total staked</td>
								<td>{staked}</td>
							</tr>
							<tr>
								<td>Total value</td>
								<td>{usdValue}</td>
							</tr>

							<tr>
								<td>APR</td>
								<td>{apr} %</td>
							</tr>

							<tr>
								<td>Savings</td>
								<td>{context.network.tokenToRex(unstakable)}</td>
							</tr>
							<tr>
								<td>Available for claim</td>
								<td>{context.network.tokenToRex(claimable)}</td>
							</tr>
							<tr>
								<td>REX fund</td>
								<td>{withdrawable}</td>
							</tr>
						</tbody>
					</table>
				</Card>
				<UnstakingBalances records={unstaking} />
			</Switcher>
		</Stack>
	{:else}
		<p>Loading staking details...</p>
	{/if}
</Stack>
