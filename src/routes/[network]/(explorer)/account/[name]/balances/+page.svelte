<script lang="ts">
	import AssetText from '$lib/components/elements/asset.svelte';

	const { data } = $props();
</script>

{#if data.account?.balances && data.account.balances.length}
	<table class="table-styles">
		<thead>
			<tr>
				<th>Token</th>
				<th>Amount</th>
			</tr>
		</thead>
		<tbody>
			{#each data.account.balances as balance}
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
