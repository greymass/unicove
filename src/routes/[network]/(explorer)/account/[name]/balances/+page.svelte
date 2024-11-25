<script lang="ts">
	import AssetText from '$lib/components/elements/asset.svelte';
	import { UInt64 } from '@wharfkit/antelope';

	const { data } = $props();
	const zero = UInt64.from(0);
	const balances = $derived(data.account.balances.filter((item) => item.asset.units.gt(zero)));
</script>

{#if balances.length}
	<table class="table-styles">
		<thead>
			<tr>
				<th>Token</th>
				<th>Amount</th>
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
							<span>{balance.asset.symbol.name}</span>
						</div>
					</td>
					<td>
						<AssetText value={balance.asset} />
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
{/if}
