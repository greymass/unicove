<script lang="ts">
	import AssetText from '$lib/components/elements/asset.svelte';
	import { Asset, UInt64 } from '@wharfkit/antelope';
	import TradingPair from '$lib/components/elements/tradingpair.svelte';
	import { cn } from '$lib/utils/style';
	import type { NetworkState } from '$lib/state/network.svelte';
	import { TokenBalance, tokenEquals, type TokenPair } from '$lib/types/token';
	import { ChevronDown, ChevronRight } from 'lucide-svelte';
	import * as m from '$lib/paraglide/messages';
	import Button from '../button/button.svelte';
	import { getContext } from 'svelte';
	import type { UnicoveContext } from '$lib/state/client.svelte';

	const context = getContext<UnicoveContext>('state');

	interface TokenOverviewProps {
		balance: TokenBalance;
		class?: string;
		child?: string;
		cta?: {
			text: string;
			href: string;
			visible: boolean;
		};
		isCurrentUser: boolean;
		open?: boolean;
		network: NetworkState;
		pair?: TokenPair;
		value: Asset;
	}

	let {
		balance: _balance,
		class: className = 'break-after-avoid',
		child,
		cta,
		isCurrentUser,
		network,
		open = $bindable(false),
		pair,
		value
	}: TokenOverviewProps = $props();

	const balance = $derived(child ? _balance.child(child) : _balance);
	const balanceRefunding = $derived(_balance.child('refunding'));
	const balanceStaked = $derived(_balance.child('staked'));
	const balanceUnstaked = $derived(_balance.child('unstaked'));
	const balanceDelegated = $derived(_balance.child('delegated'));
	const isRamToken = $derived(tokenEquals(_balance.token.id, network.getRamTokenDefinition()));
	const balanceUsed = $derived(_balance.child('used'));
	const hasValue = $derived(network.supports('delphioracle') || context.settings.data.mockPrice);
</script>

{#snippet SubBalance(label: string, value: Asset, action?: { text: string; href: string })}
	<div class="flex flex-wrap items-center gap-x-4 gap-y-2">
		<div class="flex flex-col gap-1">
			{label}
		</div>
		<div class="flex flex-1 flex-col gap-1 text-right text-nowrap">
			<AssetText {value} />
		</div>
		<div class="flex w-14 flex-col gap-1 text-right text-nowrap">
			{#if action && isCurrentUser}
				<a class="text-sky-500 hover:text-sky-400" href={action.href}>
					{action.text}
				</a>
			{/if}
		</div>
	</div>
{/snippet}

<div class={cn('bg-mine-950', className)}>
	<div class="bg-shark-900/30 flex flex-wrap items-center gap-x-4 gap-y-2 p-6">
		<picture class="size-14 place-items-center">
			<img alt="{_balance.token.name} Logo" src={_balance.token.media?.logo?.light} />
		</picture>
		<div class="flex flex-col gap-1">
			<h4 class="text-xl font-bold text-white capitalize">
				{#if isRamToken}
					<a href="/{network}/ram">
						{balance.token.name} (RAM)
					</a>
				{:else}
					<a href="/{network}/token/{balance.token.contract}/{balance.token.name}">
						{balance.token.name}
					</a>
				{/if}
			</h4>
			{#if pair && hasValue}
				{#if pair.price.units.gt(UInt64.from(0))}
					<TradingPair value={pair} />
				{:else}
					<span class="bg-mine-900 animate-pulse rounded tabular-nums">&nbsp;</span>
				{/if}
			{/if}
		</div>
		<div class="flex flex-1 flex-col gap-1 text-right text-nowrap">
			{#if pair && hasValue}
				<h4 class="text-xl font-bold text-white capitalize">
					{#if value.units.gt(UInt64.from(0))}
						<AssetText variant="full" {value} />
					{:else}
						<span class="bg-mine-900 animate-pulse rounded tabular-nums">&nbsp;</span>
					{/if}
				</h4>
			{/if}
			<AssetText value={balance.balance} />
		</div>
		<button class="size-14 cursor-pointer place-items-center" onclick={() => (open = !open)}>
			{#if open}
				<ChevronDown />
			{:else}
				<ChevronRight />
			{/if}
		</button>
	</div>
	{#if open && _balance instanceof TokenBalance}
		<div class="space-y-2 p-6">
			{@render SubBalance(m.common_available(), _balance.balance, {
				text: m.common_send(),
				href: `/${network}/send/${balance.token.id.url}`
			})}

			{#if tokenEquals(balance.token.id, network.token.id)}
				{#if network.supports('staking') && balanceStaked}
					{@render SubBalance(m.common_staked(), balanceStaked.balance, {
						text: m.common_staking(),
						href: `/${network}/staking`
					})}
				{/if}
				{#if balanceUnstaked && balanceUnstaked.balance.value > 0}
					{@render SubBalance(m.common_unstaked(), balanceUnstaked.balance, {
						text: m.common_withdraw(),
						href: `/${network}/staking/withdraw`
					})}
				{/if}
				{#if balanceDelegated && balanceDelegated.balance.value > 0}
					{@render SubBalance(m.common_delegated(), balanceDelegated.balance, {
						text: m.common_reclaim(),
						href: `/${network}/undelegate`
					})}
				{/if}
				{#if balanceRefunding && balanceRefunding.balance.value > 0}
					{@render SubBalance(m.common_refunding(), balanceRefunding.balance, {
						text: m.common_claim(),
						href: `/${network}/refund`
					})}
				{/if}
			{/if}

			{#if balanceUsed && balanceUsed.balance.value > 0}
				{@render SubBalance(m.common_used(), balanceUsed.balance)}
			{/if}

			{#if cta}
				<Button class="mt-4 {cta.visible ? '' : 'hidden'}" variant="secondary" href={cta.href}>
					{cta.text}
				</Button>
			{/if}
		</div>
	{/if}
</div>
