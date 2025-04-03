<script lang="ts">
	import TokenOverview from '$lib/components/card/tokenoverview.svelte';

	import { Card, MultiCard, Cluster } from '$lib/components/layout';
	import AssetText from '$lib/components/elements/asset.svelte';
	import type { MarketContext, UnicoveContext } from '$lib/state/client.svelte';
	import { getContext } from 'svelte';
	import DollarSign from 'lucide-svelte/icons/dollar-sign';
	import Tokendistribution from '$lib/components/chart/tokendistribution.svelte';
	import ResourceCard from '$lib/components/elements/resourceCard.svelte';
	import Button from '$lib/components/button/button.svelte';
	import * as m from '$lib/paraglide/messages';
	import { AccountValueState } from '$lib/state/value.svelte.js';
	import CurrencySelect from '$lib/components/select/currency.svelte';

	const { data } = $props();

	const context = getContext<UnicoveContext>('state');
	const market = getContext<MarketContext>('market');

	const currentAccountValue = $derived(
		new AccountValueState({
			account: data.account,
			network: data.network,
			settings: context.settings,
			market: market.market
		})
	);

	const isCurrentUser = $derived(
		(context.account?.name && data.account.name?.equals(context.account.name)) || false
	);

	const rambalance = $derived(
		data.account.balances.find((b) => b.id.equals(data.network.getRamTokenDefinition()))
	);

	const cpuAvailable = $derived(data.account.resources.cpu.available);
	const netAvailable = $derived(data.account.resources.net.available);

	const legacytoken = data.network.legacytoken;
	const legacybalance = legacytoken
		? data.account.balances.find((b) => b.id.equals(legacytoken.id))
		: undefined;
</script>

<MultiCard>
	{#if data.network.supports('delphioracle')}
		<Card id="account-value" style="column-span: all;">
			<Cluster class="items-center">
				<picture class="bg-mine-900 grid size-12 place-items-center rounded-full">
					<DollarSign />
				</picture>
				{#if currentAccountValue}
					<div>
						<p>{m.account_page_total_value()}</p>
						{#if currentAccountValue.hasPrice}
							<AssetText
								class="text-2xl font-bold text-white"
								variant="full"
								value={currentAccountValue.systemtoken.total}
							/>
						{:else}
							<div class="bg-mine-900 w-48 animate-pulse rounded text-2xl font-bold text-white">
								&nbsp;
							</div>
						{/if}
					</div>
				{/if}
				<CurrencySelect />
			</Cluster>
		</Card>
	{/if}

	{#if data.account.balance}
		<TokenOverview
			balance={data.account.balance}
			cta={legacytoken
				? {
						text: m.common_swap_to_token({ token: legacytoken.name }),
						href: `/${data.network}/swap/${data.network.token.id.url}/${legacytoken.id.url}`,
						visible: isCurrentUser
					}
				: undefined}
			{isCurrentUser}
			network={data.network}
			pair={currentAccountValue.pair}
			value={currentAccountValue.systemtoken.systemtoken}
		/>
	{/if}

	{#if legacytoken && legacybalance}
		<TokenOverview
			balance={legacybalance}
			cta={{
				text: m.common_swap_to_token({ token: data.network.token.name }),
				href: `/${data.network}/swap/${legacytoken.id.url}/${data.network.token.id.url}`,
				visible: isCurrentUser
			}}
			{isCurrentUser}
			network={data.network}
			pair={currentAccountValue.pair}
			value={currentAccountValue.systemtoken.legacy}
		/>
	{/if}

	{#if rambalance}
		<TokenOverview
			balance={rambalance}
			cta={{
				text: m.common_ram_market(),
				href: `/${data.network}/ram`,
				visible: isCurrentUser
			}}
			class=""
			{isCurrentUser}
			network={data.network}
			pair={market.network.ram}
			value={currentAccountValue.systemtoken.ram}
		/>
	{/if}

	<Tokendistribution data={currentAccountValue.systemtoken} />

	{#if context.settings.data.advancedMode}
		<Card title={m.common_resources()}>
			<div class="flex flex-wrap gap-12 *:flex-1">
				<ResourceCard type="cpu" value={cpuAvailable} vertical />

				<ResourceCard type="net" value={netAvailable} vertical />
			</div>
			{#if isCurrentUser}
				<Button href={`/${data.network}/resources`} variant="secondary"
					>{m.common_resources()}</Button
				>
			{/if}
		</Card>
	{/if}
</MultiCard>
