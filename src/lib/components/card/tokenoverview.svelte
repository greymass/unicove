<script lang="ts">
	import { Stack, Card } from '$lib/components/layout';
	import AssetText from '$lib/components/elements/asset.svelte';
	import { Asset, UInt64 } from '@wharfkit/antelope';
	import TradingPair from '$lib/components/elements/tradingpair.svelte';
	import Chip from '$lib/components/chip.svelte';
	import { Breakdown, BreakdownRow } from '$lib/components/breakdown';
	import * as m from '$lib/paraglide/messages';
	import type { NetworkState } from '$lib/state/network.svelte';
	import type { TokenBalance, TokenPair } from '$lib/types/token';
	import Button from '../button/button.svelte';

	interface TokenOverviewProps {
		balance: TokenBalance;
		class?: string;
		cta?: {
			text: string;
			href: string;
			visible: boolean;
		};
		isCurrentUser: boolean;
		network: NetworkState;
		pair?: TokenPair;
		value: Asset;
	}

	const {
		balance,
		class: className = 'break-after-avoid',
		cta,
		isCurrentUser,
		network,
		pair,
		value
	}: TokenOverviewProps = $props();

	const balanceRefunding = $derived(balance.child('refunding'));
	const balanceStaked = $derived(balance.child('staked'));
	const balanceUnstaked = $derived(balance.child('unstaked'));
	const balanceDelegated = $derived(balance.child('delegated'));
	const balanceTotal = $derived(balance.child('total'));

	const hasValue = $derived(value.units.gt(UInt64.from(0)));
</script>

<Card id="{balance.id.contract}-{balance.id.symbol.name}-token" class={className}>
	<div class="card-title h4">
		<a href="/{network}/token/{balance.id.contract}/{balance.id.symbol.name}">
			{balance.id.symbol.name}
		</a>
	</div>
	<Stack>
		{#if hasValue}
			<div
				class="border-mine-900 col-span-full grid min-h-12 grid-cols-subgrid items-center gap-x-4"
			>
				<div
					class="col-start-1 col-end-3 row-start-1 flex flex-col py-2 @xs:flex-row @xs:justify-between"
				>
					<Stack class="gap-2">
						<h4 class="text-muted text-base leading-none">{m.common_value()}</h4>
						<p class="text-xl leading-none font-semibold text-white">
							<AssetText variant="full" {value} />
						</p>
						{#if pair}
							<Chip>
								<TradingPair value={pair} />
								<!-- TODO: Percent change -->
							</Chip>
						{/if}
					</Stack>
				</div>

				{#if network.supports('directfunding') && isCurrentUser}
					<div class="col-span-2 col-start-2 row-start-1 text-right @xs:col-span-1 @xs:col-start-3">
						<a
							class="inline-block h-12 content-center text-sky-500 hover:text-sky-400"
							href={`/${network}/fund`}
						>
							{m.common_add_funds()}
						</a>
					</div>
				{/if}
			</div>
		{/if}

		<Breakdown {isCurrentUser}>
			<BreakdownRow
				key={m.common_available()}
				value={balance.balance}
				action={{
					text: m.common_send(),
					href: `/${network}/send/${balance.id.contract}/${balance.id.symbol}`,
					visible: isCurrentUser
				}}
			/>

			{#if balance.id.equals(network.token.id)}
				{#if network.supports('staking')}
					<BreakdownRow
						key={m.common_staked()}
						value={balanceStaked.balance}
						action={{
							text: m.common_staking(),
							href: `/${network}/staking`,
							visible: isCurrentUser
						}}
					/>
				{/if}

				{#if balanceUnstaked && balanceUnstaked.balance.value > 0}
					<BreakdownRow
						key={m.common_unstaked()}
						value={balanceUnstaked.balance}
						action={{
							text: m.common_withdraw(),
							href: `/${network}/staking/withdraw`,
							visible: isCurrentUser
						}}
					/>
				{/if}

				{#if balanceDelegated && balanceDelegated.balance.value > 0}
					<BreakdownRow
						key={m.common_delegated()}
						value={balanceDelegated.balance}
						action={{
							text: m.common_reclaim(),
							href: `/${network}/undelegate`,
							visible: isCurrentUser
						}}
					/>
				{/if}

				{#if balanceRefunding && balanceRefunding.balance.value > 0}
					<BreakdownRow
						key={m.common_refunding()}
						value={balanceRefunding.balance}
						action={{
							text: m.common_claim(),
							href: `/${network}/refund`,
							visible: isCurrentUser
						}}
					/>
				{/if}
			{/if}

			{#if balanceTotal && balanceTotal.balance.value > 0}
				<BreakdownRow key={m.common_total()} value={balanceTotal.balance} />
			{/if}
		</Breakdown>

		{#if cta}
			<Button class="mt-4 {cta.visible ? '' : 'hidden'}" variant="secondary" href={cta.href}>
				{cta.text}
			</Button>
		{/if}
	</Stack>
</Card>
