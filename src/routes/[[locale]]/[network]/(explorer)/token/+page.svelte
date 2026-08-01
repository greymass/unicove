<script lang="ts">
	import { getContext } from 'svelte';
	import { Stack, Table, TD, TH, TR } from 'unicove-components';

	import AssetText from '$lib/components/elements/asset.svelte';
	import type { MarketContext, UnicoveContext } from '$lib/state/client.svelte';
	import { Currencies } from '$lib/types/currencies';
	import { TokenDefinition } from '$lib/types/token';

	const { data } = $props();
	const context = getContext<UnicoveContext>('state');
	const market = getContext<MarketContext>('market');

	const locale = $derived(String(data.locale ?? 'en'));
	const currency = $derived(Currencies[context.settings.data.displayCurrency]);

	const hasPrices = $derived(
		context.network.supports('delphioracle') || context.settings.data.mockPrice
	);
	const hasHolders = $derived(data.tokens.some((token) => token.holders !== undefined));

	function price(row: { contract: string; symbol: string }) {
		return market.market.getPair(
			TokenDefinition.from({
				chain: context.network.chain.id,
				contract: row.contract,
				symbol: row.symbol
			}),
			currency
		)?.price;
	}
</script>

<Stack class="gap-6">
	<Table full>
		{#snippet thead()}
			<TH>Token</TH>
			<TH>Contract</TH>
			{#if hasPrices}
				<TH class="text-right">Price</TH>
			{/if}
			{#if hasHolders}
				<TH class="text-right">Holders</TH>
			{/if}
		{/snippet}
		{#each data.tokens as token (token.url)}
			{@const pair = hasPrices ? price(token) : undefined}
			<TR>
				<TD>
					<a class="text-primary font-semibold" href={context.urlPath(`/token/${token.url}`)}>
						{token.name}
					</a>
				</TD>
				<TD>
					<a class="text-on-surface-variant" href={context.urlPath(`/contract/${token.contract}`)}>
						{token.contract}
					</a>
				</TD>
				{#if hasPrices}
					<TD class="text-right font-mono tabular-nums">
						{#if pair}
							<AssetText variant="full" value={pair} />
						{/if}
					</TD>
				{/if}
				{#if hasHolders}
					<TD class="text-right font-mono tabular-nums">
						{#if token.holders !== undefined}
							{token.holders.toLocaleString(locale)}
						{/if}
					</TD>
				{/if}
			</TR>
		{/each}
	</Table>
</Stack>
