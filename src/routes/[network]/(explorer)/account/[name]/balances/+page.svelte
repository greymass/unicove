<script lang="ts">
	import AssetText from '$lib/components/elements/asset.svelte';
	import ValueText from '$lib/components/elements/currency/value.svelte';
	import { Asset } from '@wharfkit/antelope';

	import type { UnicoveContext } from '$lib/state/client.svelte';
	import { getContext } from 'svelte';
	import * as m from '$lib/paraglide/messages';
	import { ZeroUnits } from '$lib/types/token.js';

	const { data } = $props();
	const balances = $derived(
		data.account.balances.filter((item) => item.balance.units.gt(ZeroUnits))
	);

	const context = getContext<UnicoveContext>('state');

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
		<a class="text-sky-500 hover:text-sky-400" href="/{data.network}/send?quantity={asset}">
			{m.common_send()}
		</a>
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
								<!-- {#if tokenBalance.id.meta.logo}
									<img class="h-5 w-5" src={tokenBalance.id.meta.logo} alt="LOGO" />
								{/if} -->
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
						<ValueText token={tokenBalance.token.id} balance={tokenBalance.balance} />
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
