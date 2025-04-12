<script lang="ts">
	import Button from '$lib/components/button/button.svelte';
	import Code from '$lib/components/code.svelte';
	import Account from '$lib/components/elements/account.svelte';
	import AssetText from '$lib/components/elements/asset.svelte';
	import type { UnicoveContext } from '$lib/state/client.svelte.js';
	import { getContext } from 'svelte';

	const context = getContext<UnicoveContext>('state');
	const { data } = $props();
</script>

<table class="table-styles">
	<tbody>
		<tr>
			<td> Total Accounts Holding </td>
			<td class="text-right">
				{data.numholders.toLocaleString()}
			</td>
		</tr>
		<tr>
			<td> Supply </td>
			<td class="text-right">
				<AssetText value={data.stats.supply} />
			</td>
		</tr>
		<tr>
			<td> Max Supply </td>
			<td class="text-right">
				<AssetText value={data.stats.max_supply} />
			</td>
		</tr>
		<tr>
			<td> Issuer </td>
			<td class="text-right">
				<Account name={data.stats.issuer} />
			</td>
		</tr>
	</tbody>
</table>

{#if data.topholders.length}
	<h2 class="text-2xl font-semibold text-on-surface">Top 100 Accounts</h2>
	<table class="table-styles">
		<thead>
			<tr>
				<th>#</th>
				<th>Account</th>
				<th class="text-right">Balance</th>
			</tr>
		</thead>
		<tbody>
			{#each data.topholders as holder, idx}
				<tr>
					<td>{idx + 1}</td>
					<td>
						<Account name={holder.account}>
							{#if data.network.config.lockedsupply?.find( (locked) => holder.account.equals(locked) )}
								{holder.account} <span class="text-muted">(Locked Supply)</span>
							{:else}
								{holder.account}
							{/if}
						</Account>
					</td>
					<td class="text-right">
						<AssetText value={holder.balance} />
					</td>
				</tr>
			{/each}
		</tbody>
	</table>

	{#if data.loadMoreUrl}
		<Button href={data.loadMoreUrl} data-sveltekit-noscroll data-sveltekit-replacestate
			>Load more</Button
		>
	{/if}
{/if}

{#if context.settings.data.debugMode}
	<Code>
		{JSON.stringify(data, null, 2)}
	</Code>
{/if}
