<script lang="ts">
	import { Stack, Card, MultiCard, Cluster } from '$lib/components/layout';
	import AssetText from '$lib/components/elements/asset.svelte';
	import { Asset } from '@wharfkit/antelope';
	import type { MarketContext, UnicoveContext } from '$lib/state/client.svelte';
	import { getContext } from 'svelte';
	import DollarSign from 'lucide-svelte/icons/dollar-sign';
	import TradingPair from '$lib/components/elements/tradingpair.svelte';
	import Chip from '$lib/components/chip.svelte';
	import Tokendistribution from '$lib/components/chart/tokendistribution.svelte';
	import ResourceCard from '$lib/components/elements/resourceCard.svelte';
	import Button from '$lib/components/button/button.svelte';
	import { Breakdown, BreakdownRow } from '$lib/components/breakdown';
	import * as m from '$lib/paraglide/messages';
	import { AccountValueState } from '$lib/state/value.svelte.js';

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

	const tokenAvailable = $derived(data.account.balance?.liquid);
	const tokenLegacy = $derived(data.account.balance?.legacy);
	const tokenRefunding = $derived(data.account.balance?.refunding);
	const tokenStaked = $derived(data.account.balance?.staked);
	const tokenUnstaked = $derived(data.account.balance?.unstaked);
	const tokenDelegated = $derived(data.account.balance?.delegated);
	const tokenTotal = $derived(data.account.balance?.total);

	const ramOwned = $derived(Asset.fromUnits(data.account.resources.ram.owned, '3,KB'));
	const ramMax = $derived(Asset.fromUnits(data.account.resources.ram.max, '3,KB'));
	const ramUsed = $derived(Asset.fromUnits(data.account.resources.ram.used, '3,KB'));
	const ramGifted = $derived(Asset.fromUnits(data.account.resources.ram.gifted, '3,KB'));
	const ramCreator = $derived(Asset.fromUnits(data.account.resources.ram.creator, '3,KB'));
	const ramSystem = $derived(Asset.fromUnits(data.account.resources.ram.system, '3,KB'));
	const ramAvailable = $derived(Asset.fromUnits(data.account.resources.ram.available, '3,KB'));
	const ramBalance = $derived(Asset.fromUnits(data.account.resources.ram.balance, '3,KB'));

	const cpuAvailable = $derived(data.account.resources.cpu.available);
	const netAvailable = $derived(data.account.resources.net.available);
</script>

<!-- What gets shown on this page if data.account doesn't exist? -->
{#if data.account && currentAccountValue}
	<MultiCard>
		<Card id="account-value" style="column-span: all;">
			<Cluster class="items-center">
				<picture class="bg-mine-900 grid size-12 place-items-center rounded-full">
					<DollarSign />
				</picture>
				{#if currentAccountValue}
					<div>
						<p>{m.account_page_total_value()}</p>
						<AssetText
							class="text-2xl font-bold text-white"
							variant="full"
							value={currentAccountValue.systemtoken.total}
						/>
					</div>
				{/if}
			</Cluster>
		</Card>

		<Card
			id="system-token"
			title={String(data.network.chain.systemToken?.symbol.name)}
			class="break-after-avoid"
		>
			<Stack>
				<div
					class="border-mine-900 col-span-full grid min-h-12 grid-cols-subgrid items-center gap-x-4"
				>
					<div
						class="col-start-1 col-end-3 row-start-1 flex flex-col py-2 @xs:flex-row @xs:justify-between"
					>
						<Stack class="gap-2">
							<h4 class="text-muted text-base leading-none">{m.common_value()}</h4>
							<p class="text-xl leading-none font-semibold text-white">
								<AssetText variant="full" value={currentAccountValue.systemtoken.systemtoken} />
							</p>
							{#if currentAccountValue.pair}
								<Chip>
									<TradingPair value={market.network.systemtoken} />
									<!-- TODO: Percent change -->
								</Chip>
							{/if}
						</Stack>
					</div>

					{#if data.network.supports('directfunding') && isCurrentUser}
						<div
							class="col-span-2 col-start-2 row-start-1 text-right @xs:col-span-1 @xs:col-start-3"
						>
							<a
								class="inline-block h-12 content-center text-sky-500 hover:text-sky-400"
								href={`/${data.network}/fund`}
							>
								{m.common_add_funds()}
							</a>
						</div>
					{/if}
				</div>

				<Breakdown {isCurrentUser}>
					<BreakdownRow
						key={m.common_available()}
						value={tokenAvailable}
						action={{
							text: m.common_send(),
							href: `/${data.network}/send`,
							visible: isCurrentUser
						}}
					/>

					{#if data.network.supports('staking')}
						<BreakdownRow
							key={m.common_staked()}
							value={tokenStaked}
							action={{
								text: m.common_staking(),
								href: `/${data.network}/staking`,
								visible: isCurrentUser
							}}
						/>
					{/if}

					{#if tokenUnstaked && tokenUnstaked.value > 0}
						<BreakdownRow
							key={m.common_unstaked()}
							value={tokenUnstaked}
							action={{
								text: m.common_withdraw(),
								href: `/${data.network}/staking/withdraw`,
								visible: isCurrentUser
							}}
						/>
					{/if}

					{#if tokenDelegated && tokenDelegated.value > 0}
						<BreakdownRow
							key={m.common_delegated()}
							value={tokenDelegated}
							action={{
								text: m.common_reclaim(),
								href: `/${data.network}/undelegate`,
								visible: isCurrentUser
							}}
						/>
					{/if}

					{#if tokenRefunding && tokenRefunding.value > 0}
						<BreakdownRow
							key={m.common_refunding()}
							value={tokenRefunding}
							action={{
								text: m.common_claim(),
								href: `/${data.network}/refund`,
								visible: isCurrentUser
							}}
						/>
					{/if}

					<BreakdownRow key={m.common_total()} value={tokenTotal} />
				</Breakdown>
			</Stack>
		</Card>

		{#if data.network.config.legacytoken}
			{@const legacySymbol = Asset.Symbol.from(data.network.config.legacytoken.symbol)}
			<Card id="legacy-token" title={legacySymbol.name} class="break-after-avoid">
				<Stack>
					<div
						class="border-mine-900 col-span-full grid min-h-12 grid-cols-subgrid items-center gap-x-4"
					>
						<div
							class="col-start-1 col-end-3 row-start-1 flex flex-col py-2 @xs:flex-row @xs:justify-between"
						>
							<Stack class="gap-2">
								<h4 class="text-muted text-base leading-none">{m.common_value()}</h4>
								<p class="text-xl leading-none font-semibold text-white">
									<AssetText variant="full" value={currentAccountValue.systemtoken.legacy} />
								</p>
								{#if currentAccountValue.pair}
									<Chip>
										<TradingPair value={market.network.legacytoken} />
										<!-- TODO: Percent change -->
									</Chip>
								{/if}
							</Stack>
						</div>
					</div>

					<Breakdown {isCurrentUser}>
						<BreakdownRow
							key={m.common_available()}
							value={tokenLegacy}
							action={{
								text: m.common_swap_to_token({
									token: data.network.chain.systemToken?.symbol.name || ''
								}),
								href: `/${data.network}/swap`,
								visible: isCurrentUser
							}}
						/>
					</Breakdown>
				</Stack>
			</Card>
		{/if}

		<Card id="ram" title="RAM" class="">
			<Stack>
				<Stack class="gap-2">
					<h4 class="text-muted text-base leading-none">{m.common_value()}</h4>
					<p class="text-xl leading-none font-semibold text-white">
						<AssetText variant="full" value={currentAccountValue.systemtoken.ram} />
					</p>
					{#if currentAccountValue.pair}
						<Chip>
							<TradingPair value={market.network.ram} />
							<!-- TODO: Percent change -->
						</Chip>
					{/if}
				</Stack>

				<Breakdown {isCurrentUser}>
					<BreakdownRow
						key={m.common_available()}
						value={ramBalance}
						action={{
							text: m.common_ram_market(),
							href: `/${data.network}/ram`,
							visible: isCurrentUser
						}}
					/>
					<BreakdownRow key={m.common_total()} value={ramOwned} />
				</Breakdown>

				{#if context.settings.data.debugMode}
					<Breakdown title="RAM Usage">
						<BreakdownRow key={m.common_available()} value={ramAvailable} />
						<BreakdownRow key={m.common_used()} value={ramUsed} />
						<BreakdownRow key={m.common_total()} value={ramMax} />
					</Breakdown>
					<Breakdown title="Gifted RAM">
						<BreakdownRow key="Gifted (System)" value={ramSystem} />
						<BreakdownRow key="Gifted (Creator)" value={ramCreator} />
						<BreakdownRow key="Total" value={ramGifted} />
					</Breakdown>
				{/if}
			</Stack>
		</Card>

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
{/if}
