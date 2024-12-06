<script lang="ts">
	import AssetText from '$lib/components/elements/asset.svelte';
	import { Asset, UInt64 } from '@wharfkit/antelope';

	import type { UnicoveContext } from '$lib/state/client.svelte';
	import { getContext } from 'svelte';

	const { data } = $props();
	const zero = UInt64.from(0);
	const balances = $derived(data.account.balances.filter((item) => item.asset.units.gt(zero)));

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
		<a class="text-skyBlue-500 hover:text-skyBlue-400" href="/{data.network}/send?quantity={asset}"
			>Send</a
		>
	</td>
{/snippet}

{#if balances.length}
	<table class="table-styles">
		<thead>
			<tr>
				<th>Token</th>
				<th>Amount</th>
				{#if isCurrentUser}
					<th></th>
				{/if}
			</tr>
		</thead>
		<tbody>
			{#each balances as balance}
				<tr>
					<td>
						<div class="flex items-center gap-3">
							<div class="flex h-6 w-6 items-center justify-center rounded-full bg-black">
								{#if balance.metadata?.logo}
									<img class="h-5 w-5" src={balance.metadata?.logo} alt="LOGO" />
								{/if}
							</div>
							<a
								href={`/${context.network}/token/${balance.contract}/${balance.asset.symbol.name}`}
							>
								{balance.asset.symbol.name}
							</a>
						</div>
					</td>
					<td>
						<AssetText value={balance.asset} />
					</td>
					{#if isCurrentUser}
						{@render tableAction(balance.asset)}
					{/if}
				</tr>
			{/each}
		</tbody>
	</table>
{/if}
