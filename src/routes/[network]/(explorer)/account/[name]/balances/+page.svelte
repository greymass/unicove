<script lang="ts">
	import AssetText from '$lib/components/elements/asset.svelte';
	import { Asset } from '@wharfkit/antelope';

	import type { MarketContext, UnicoveContext } from '$lib/state/client.svelte';
	import { getContext } from 'svelte';
	import * as m from '$lib/paraglide/messages';
	import { TokenBalanceValue, ZeroUnits } from '$lib/types/token.js';
	import {Button} from 'unicove-components';
	import { Currencies } from '$lib/types/currencies.js';

	const { data } = $props();
	const context = getContext<UnicoveContext>('state');
	const market = getContext<MarketContext>('market');

	const currency = Currencies[context.settings.data.displayCurrency];

	const balances = $derived(
		data.account.balances
			.filter((item) => item.balance.units.gt(ZeroUnits))
			.map((item) => {
				const pair = market.market.getPair(item.token.id, currency);
				if (pair) {
					return TokenBalanceValue.from({
						...item,
						token: {
							...item.token,
							// Merge media from token and pair
							media: {
								...item.token.media,
								...pair.base.media
							}
						},
						value: market.market.value(item.token.id, currency, item.balance)
					});
				} else {
					return TokenBalanceValue.from({
						...item,
						value: Asset.fromUnits(0, currency.symbol)
					});
				}
			})
			.sort((a, b) => (a.value.units.gt(b.value.units) ? -1 : 1))
	);

	const isCurrentUser = $derived(
		context.account &&
			context.account.name &&
			data.account &&
			data.account.name &&
			data.account.name.equals(context.account.name)
	);
</script>

{#snippet tableAction(asset: Asset)}
	<td class="text-right">
		<Button variant="text" href="/{data.network}/send?quantity={asset}">
			{m.common_send()}
		</Button>
	</td>
{/snippet}

{#if balances.length}
	<table class="table-styles">
		<thead>
			<tr>
				<th>{m.common_token()}</th>
				<th class="text-right">{m.common_amount()}</th>
				<th class="text-right">{m.common_value()} ({context.settings.data.displayCurrency})</th>
				{#if isCurrentUser}
					<th></th>
				{/if}
			</tr>
		</thead>
		<tbody>
			{#each balances as tokenBalance}
				<tr>
					<td>
						<div class="flex items-center gap-3">
							<div class="flex h-6 w-6 items-center justify-center rounded-full bg-black">
								{#if tokenBalance.token.media?.logo?.dark}
									<img
										class="h-5 w-5"
										src={tokenBalance.token.media?.logo?.dark}
										alt={`${tokenBalance.token.name} Logo`}
									/>
								{/if}
							</div>
							<a
								href={`/${context.network}/token/${tokenBalance.token.contract}/${tokenBalance.token.name}`}
							>
								{tokenBalance.token.name}
							</a>
						</div>
					</td>
					<td class="text-right">
						<AssetText value={tokenBalance.balance} />
					</td>
					<td class="text-right">
						{#if tokenBalance.value.units.gt(ZeroUnits)}
							<AssetText value={tokenBalance.value} />
						{/if}
					</td>
					{#if isCurrentUser}
						{#if !tokenBalance.locked}
							{@render tableAction(tokenBalance.balance)}
						{/if}
					{/if}
				</tr>
			{/each}
		</tbody>
	</table>
{:else}
	<p>{m.common_no_balances()}</p>
{/if}
