<script lang="ts">
	import AssetText from '$lib/components/elements/asset.svelte';
	import { Asset } from '@wharfkit/antelope';
	import TradingPair from '$lib/components/elements/tradingpair.svelte';
	import { cn } from '$lib/utils/style';
	import type { NetworkState } from '$lib/state/network.svelte';
	import {
		TokenBalance,
		tokenEquals,
		TokenHistoricPrice,
		ZeroUnits,
		type TokenPair
	} from '$lib/types/token';
	import { ChevronRight } from 'lucide-svelte';
	import * as m from '$lib/paraglide/messages';
	import Button from '../button/button.svelte';
	import { getContext } from 'svelte';
	import type { UnicoveContext } from '$lib/state/client.svelte';
	import Code from '../code.svelte';
	import Link from '../elements/link.svelte';

	const context = getContext<UnicoveContext>('state');

	interface CTA {
		text: string;
		href: string;
		variant?: 'primary' | 'secondary' | 'tertiary' | 'pill';
		visible: boolean;
	}

	interface TokenOverviewProps {
		balance: TokenBalance;
		class?: string;
		child?: string;
		cta?: CTA[];
		debug?: boolean;
		isCurrentUser: boolean;
		open?: boolean;
		network: NetworkState;
		historic?: TokenHistoricPrice;
		historicTimeframe?: string;
		pair?: TokenPair;
		value: Asset;
	}

	let {
		balance: _balance,
		class: className = 'break-after-avoid',
		child,
		cta,
		debug = false,
		isCurrentUser,
		network,
		open = $bindable(false),
		historic,
		historicTimeframe,
		pair,
		value
	}: TokenOverviewProps = $props();

	const balance = $derived(child ? _balance.child(child) : _balance);
	const isRamToken = $derived(tokenEquals(_balance.token.id, network.getRamToken().id));
	const hasValue = $derived(network.supports('delphioracle') || context.settings.data.mockPrice);
	const balanceRefunding = $derived(_balance.child('refunding'));
	const balanceStaked = $derived(_balance.child('staked'));
	const balanceUnstaked = $derived(_balance.child('unstaked'));
	const balanceDelegated = $derived(_balance.child('delegated'));
	const balanceUsed = $derived(_balance.child('used'));

	let shouldBeOpen = $derived(open && _balance instanceof TokenBalance);

	let detailsElement = $state<HTMLDetailsElement>();

	const toggleOpen = (e: Event) => {
		e.preventDefault();
		if (!detailsElement || !(_balance instanceof TokenBalance)) return;
		if (open) {
			open = false;
			detailsElement.removeAttribute('open');
		} else {
			detailsElement.open = true;
			open = true;
		}
	};
</script>

{#snippet SubBalance(label: string, value: Asset, action?: { text: string; href: string })}
	<div class="col-span-full grid grid-cols-subgrid items-center gap-x-4">
		<div class="flex flex-col gap-1">
			{label}
		</div>
		<div class="flex flex-1 flex-col gap-1 text-right text-nowrap">
			<AssetText {value} />
		</div>
		<div class="flex flex-col gap-1 text-nowrap">
			{#if action && isCurrentUser}
				<Button variant="tertiary" href={action.href} class="self-start">
					{action.text}
				</Button>
			{/if}
		</div>
	</div>
{/snippet}

<details
	bind:this={detailsElement}
	class={cn('group token-balance-card bg-surface-container rounded-xl', className)}
	open={shouldBeOpen}
>
	<summary
		class="focus-visible:outline-solar-500 @container grid cursor-pointer grid-cols-[auto_1fr_auto] gap-3 rounded-xl p-5 focus-visible:outline"
		onclick={(e) => toggleOpen(e)}
	>
		<picture class="size-6 place-items-center">
			<img alt="{_balance.token.name} Logo" src={_balance.token.media?.logo?.light} />
		</picture>

		<div class="text-muted grid gap-y-4 text-nowrap @sm:grid-cols-2">
			<div class="grid gap-px">
				<h4 class="text-on-surface text-xl leading-none font-bold capitalize">
					{#if isRamToken}
						<Link class="text-on-surface" href="/{network}/ram">
							{balance.token.name} (RAM)
						</Link>
					{:else}
						<Link
							class="text-on-surface"
							href="/{network}/token/{balance.token.contract}/{balance.token.name}"
						>
							{balance.token.name}
						</Link>
					{/if}
				</h4>

				{#if pair && hasValue}
					{#if pair.price.units.gt(ZeroUnits)}
						<TradingPair {historic} {historicTimeframe} value={pair} />
					{:else}
						<div class="bg-surface-container-high w-32 animate-pulse rounded">&nbsp;</div>
					{/if}
				{/if}
			</div>

			<div class="text-muted grid gap-px @sm:justify-items-end">
				{#if pair && hasValue}
					{#if value.units.gt(ZeroUnits)}
						<h4 class="text-on-surface text-xl leading-none font-bold capitalize">
							<AssetText variant="full" {value} />
						</h4>
					{:else}
						<div
							class="bg-surface-container-high w-full max-w-48 animate-pulse rounded-md text-right"
						>
							&nbsp;
						</div>
					{/if}
				{/if}

				<AssetText class="text-auto" value={balance.balance} variant="full" />
			</div>
		</div>

		<ChevronRight class="text-muted transition-transform duration-100 group-open:rotate-90" />
	</summary>

	<div class="bg-surface-container-low grid grid-cols-[auto_1fr_auto] rounded-b-xl p-5 pt-3">
		{@render SubBalance(
			m.common_available(),
			_balance.balance,
			!_balance.locked
				? {
						text: m.common_send(),
						href: `/${network}/send/${balance.token.id.url}`
					}
				: undefined
		)}

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

		{#if cta && cta.length}
			<div class="col-span-full flex gap-6">
				{#each cta as action}
					<Button
						class="mt-4 {action.visible ? '' : 'hidden'}"
						variant={action.variant || 'secondary'}
						href={action.href}
					>
						{action.text}
					</Button>
				{/each}
			</div>
		{/if}
	</div>

	{#if debug}
		<Code json={_balance} />
	{/if}
</details>
