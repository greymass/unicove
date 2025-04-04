<script lang="ts">
	import { getContext } from 'svelte';
	import DollarSign from 'lucide-svelte/icons/dollar-sign';

	import { AccountValueState } from '$lib/state/value.svelte.js';
	import { Card } from '$lib/components/layout';
	import * as m from '$lib/paraglide/messages';
	import AssetText from '$lib/components/elements/asset.svelte';
	import Button from '$lib/components/button/button.svelte';
	import CurrencySelect from '$lib/components/select/currency.svelte';
	import ResourceCard from '$lib/components/elements/resourceCard.svelte';
	import TokenBalance from '$lib/components/card/tokenbalance.svelte';
	import Tokendistribution from '$lib/components/chart/tokendistribution.svelte';
	import type { MarketContext, UnicoveContext } from '$lib/state/client.svelte';
	import { tokenEquals } from '$lib/types/token.js';

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

	const hasValue = $derived(
		data.network.supports('delphioracle') || context.settings.data.mockPrice
	);

	const rambalance = $derived(
		data.account.balances.find((b) => tokenEquals(b.token.id, data.network.getRamTokenDefinition()))
	);

	const cpuAvailable = $derived(data.account.resources.cpu.available);
	const netAvailable = $derived(data.account.resources.net.available);

	const legacytoken = data.network.legacytoken;
	const legacybalance = legacytoken
		? data.account.balances.find((b) => tokenEquals(b.token.id, legacytoken.id))
		: undefined;

	$inspect(String(legacybalance?.balance));
</script>

<div class="xs:grid-cols-[100%] grid gap-6 lg:grid-cols-[60%_40%]">
	<div class="space-y-6">
		{#if hasValue}
			<Card id="account-value" style="column-span: all;">
				<div class="flex flex-wrap items-center gap-x-4 gap-y-2">
					<picture class="bg-mine-900 grid size-12 place-items-center rounded-full">
						<DollarSign />
					</picture>

					{#if currentAccountValue}
						<div class="flex flex-1 flex-col gap-1">
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

					<div class="flex flex-col gap-1 text-right text-nowrap">
						<CurrencySelect />
					</div>
				</div>
			</Card>
		{/if}

		{#if data.account.balance}
			<TokenBalance
				balance={data.account.balance}
				child="total"
				cta={legacytoken
					? {
							text: m.common_swap_to_token({ token: legacytoken.name }),
							href: `/${data.network}/swap/${data.network.token.id.url}/${legacytoken.id.url}`,
							visible: isCurrentUser
						}
					: undefined}
				{isCurrentUser}
				open
				network={data.network}
				pair={currentAccountValue.pair}
				value={currentAccountValue.systemtoken.systemtoken}
			/>
		{/if}

		{#if legacytoken && legacybalance}
			<TokenBalance
				balance={legacybalance}
				cta={{
					text: m.common_swap_to_token({ token: data.network.token.name }),
					href: `/${data.network}/swap/${legacytoken.id.url}/${data.network.token.id.url}`,
					visible: isCurrentUser
				}}
				{isCurrentUser}
				open
				network={data.network}
				pair={currentAccountValue.pair}
				value={currentAccountValue.systemtoken.legacy}
			/>
		{/if}

		{#if rambalance}
			<TokenBalance
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
	</div>
	<div class="space-y-6">
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
	</div>
</div>
